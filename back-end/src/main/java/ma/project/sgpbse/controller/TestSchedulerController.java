package ma.project.sgpbse.controller;

import lombok.RequiredArgsConstructor;
import ma.project.sgpbse.service.DueDateNotificationScheduler;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test/notifications")
@RequiredArgsConstructor
public class TestSchedulerController {

    private final DueDateNotificationScheduler dueDateNotificationScheduler;

    /**
     * Endpoint permettant de déclencher manuellement le traitement des échéances
     */
    @PostMapping("/trigger-due-dates")
    public ResponseEntity<String> triggerDueDateNotifications() {
        dueDateNotificationScheduler.processDueDateNotifications();
        return ResponseEntity.ok("Traitement des notifications d'échéances exécuté avec succès.");
    }
}