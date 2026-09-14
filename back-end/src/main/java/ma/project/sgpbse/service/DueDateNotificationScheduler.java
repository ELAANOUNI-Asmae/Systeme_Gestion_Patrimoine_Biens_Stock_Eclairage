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

    /**
     * One execution per day. Official documents stay in the database and generate
     * a reminder every day during their configured pre-deadline window.
     * Example: thresholdDays=7 => J-7, J-6, ... J-1 and J0.
     */
    @Scheduled(cron = "0 0 1 * * ?")
    @Transactional
    public void processDueDateNotifications() {
        List<DueDate> dueDates = dueDateRepository.findAll();
        LocalDate today = LocalDate.now();

        for (DueDate dueDate : dueDates) {
            if (dueDate.getEndDate() == null) {
                continue;
            }

            long actualMargin = ChronoUnit.DAYS.between(today, dueDate.getEndDate());
            dueDate.setMargin(actualMargin);

            String docTitle = dueDate.getDocument() != null
                    && dueDate.getDocument().getTitle_fr() != null
                    && !dueDate.getDocument().getTitle_fr().isBlank()
                    ? dueDate.getDocument().getTitle_fr()
                    : "document";

            if (actualMargin < 0) {
                dueDate.setMessage("CRITIQUE : Le document " + docTitle
                        + " est expiré depuis " + Math.abs(actualMargin) + " jour(s).");
            } else if (actualMargin == 0) {
                dueDate.setMessage("URGENT : Le document " + docTitle + " expire aujourd'hui !");
            } else {
                dueDate.setMessage("ATTENTION : Le document " + docTitle
                        + " expire dans " + actualMargin + " jour(s).");
            }

            int threshold = dueDate.getThresholdDays() != null
                    ? Math.max(0, dueDate.getThresholdDays())
                    : 30;

            // Only reminders BEFORE/on deadline; no daily post-expiration spam.
            if (actualMargin >= 0 && actualMargin <= threshold) {
                notificationService.notifyUsersWithPermission(
                        dueDate.getTargetPermission(),
                        "Alerte Échéance Document",
                        dueDate.getMessage()
                );
                log.info("Rappel d'échéance envoyé pour DueDate ID: {} (J-{})",
                        dueDate.getId(), actualMargin);
            }

            // Kept for compatibility with the existing column/older code.
            // Due dates are no longer deleted after the first alert.
            dueDate.setTreated(false);
        }

        dueDateRepository.saveAll(dueDates);
        log.info("Scheduler d'échéances terminé.");
    }
}
