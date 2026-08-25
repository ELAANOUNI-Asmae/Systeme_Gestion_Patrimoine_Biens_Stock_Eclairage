package ma.project.sgpbse.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.project.sgpbse.entity.DueDate;
import ma.project.sgpbse.repository.DueDateRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DueDateNotificationScheduler {

    private final DueDateRepository dueDateRepository;

    // Tous les matins à 01h00 du matin
    @Scheduled(cron = "0 0 1 * * ?")
    @Transactional
    public void updateAndNotifyDueDates() {
        List<DueDate> dueDates = dueDateRepository.findAll();
        LocalDate today = LocalDate.now();

        for (DueDate dueDate : dueDates) {
            // Recalcul de la marge au fil des jours
            long actualMargin = ChronoUnit.DAYS.between(today, dueDate.getEndDate());
            dueDate.setMargin(actualMargin);

            // Mise à jour du message
            if (actualMargin < 0) {
                dueDate.setMessage("CRITIQUE : Expiré depuis " + Math.abs(actualMargin) + " jour(s).");
            } else {
                dueDate.setMessage("ATTENTION : Expire dans " + actualMargin + " jour(s).");
            }

            // Déclencher une notification si la marge est <= 30 jours et pas encore notifiée
            if (actualMargin <= 30 && !Boolean.TRUE.equals(dueDate.getIsTreated())) {
                log.warn("NOTIFICATION [Doc ID {}]: {}", dueDate.getDocument().getId(), dueDate.getMessage());
            }
        }
    }

    @Scheduled(cron = "0 0 1 * * ?") // Tous les matins à 01h00
    @Transactional
    public void traiterEtNettoyerEcheances() {
        List<DueDate> dueDates = dueDateRepository.findAll();
        LocalDate today = LocalDate.now();

        for (DueDate dueDate : dueDates) {
            long margeActuelle = ChronoUnit.DAYS.between(today, dueDate.getEndDate());
            dueDate.setMargin(margeActuelle);

            // Exemple de condition pour marquer comme traité
            if (margeActuelle <= 0) {
                log.info("Traitement de l'échéance expirée pour le doc ID {}", dueDate.getDocument().getId());
                // Ton code de notification (mail, alerte systeme...)

                dueDate.setIsTreated(true); // Marquer comme traité
            }
        }

        // ⚠️ Suppression en BDD de toutes les échéances marquées comme traitées
        dueDateRepository.deleteByIsTreatedTrue();
        log.info("Nettoyage effectué : Les échéances traitées ont été supprimées de la BDD.");
    }
}
