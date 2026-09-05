package ma.project.sgpbse.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.project.sgpbse.entity.DueDate;
import ma.project.sgpbse.repository.DueDateRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DueDateNotificationScheduler {

    private final DueDateRepository dueDateRepository;
    private final NotificationService notificationService;

    @Scheduled(cron = "0 0 1 * * ?") // Exécuté tous les matins à 01h00 AM
    @Transactional
    public void processDueDateNotifications() {
        List<DueDate> dueDates = dueDateRepository.findAll();
        LocalDate today = LocalDate.now();

        for (DueDate dueDate : dueDates) {
            long actualMargin = ChronoUnit.DAYS.between(today, dueDate.getEndDate());
            dueDate.setMargin(actualMargin);

            String docTitle = (dueDate.getDocument() != null) ? dueDate.getDocument().getTitle_fr() : "";

            if (actualMargin < 0) {
                dueDate.setMessage("CRITIQUE : Le document " + docTitle + " est expiré depuis " + Math.abs(actualMargin) + " jour(s).");
            } else if (actualMargin == 0) {
                dueDate.setMessage("URGENT : Le document " + docTitle + " expire aujourd'hui !");
            } else {
                dueDate.setMessage("ATTENTION : Le document " + docTitle + " expire dans " + actualMargin + " jour(s).");
            }

            int threshold = (dueDate.getThresholdDays() != null) ? dueDate.getThresholdDays() : 30;

            if (actualMargin <= threshold && !Boolean.TRUE.equals(dueDate.getTreated())) {

                // Envoie à la permission unique associée à cette DueDate
                notificationService.notifyUsersWithPermission(
                        dueDate.getTargetPermission(),
                        "Alerte Échéance Document",
                        dueDate.getMessage()
                );

                dueDate.setTreated(true);
                log.info("Notification générée avec succès pour DueDate ID: {}", dueDate.getId());
            }
        }

        // Nettoyage des échéances traitées
        dueDateRepository.deleteByTreatedTrue();
        log.info("Scheduler d'échéances terminé et nettoyé.");
    }
}