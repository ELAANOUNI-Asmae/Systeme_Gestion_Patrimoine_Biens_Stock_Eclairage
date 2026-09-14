package ma.project.sgpbse.controller;

import lombok.RequiredArgsConstructor;
import ma.project.sgpbse.dto.notification.NotificationResponseDto;
import ma.project.sgpbse.entity.Notification;
import ma.project.sgpbse.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sgpbse/notif")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    // Personal notification API: authentication is sufficient.
    @GetMapping("/me")
    public ResponseEntity<List<NotificationResponseDto>> getMine() {
        return ResponseEntity.ok(notificationService.getCurrentUserNotifications());
    }

    @GetMapping("/me/unread/count")
    public ResponseEntity<Long> countMineUnread() {
        return ResponseEntity.ok(notificationService.countUnreadCurrentUserNotifications());
    }

    @PostMapping("/me/{notifId}/read")
    public ResponseEntity<NotificationResponseDto> markMineAsRead(@PathVariable Long notifId) {
        return ResponseEntity.ok(notificationService.markCurrentUserAsRead(notifId));
    }

    @PostMapping("/me/read-all")
    public ResponseEntity<Void> markMineAllAsRead() {
        notificationService.markAllCurrentUserAsRead();
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/me/{notifId}")
    public ResponseEntity<Void> deleteMine(@PathVariable Long notifId) {
        notificationService.deleteCurrentUserNotification(notifId);
        return ResponseEntity.noContent().build();
    }

    // Legacy routes preserved for compatibility.
    @PostMapping("/mark_as_read/{notif_id}")
    @PreAuthorize("hasAuthority('MARK_NOTIF_AS_READ')")
    public ResponseEntity<String> markAsRead(@PathVariable Long notif_id) {
        return ResponseEntity.ok(notificationService.markAsRead(notif_id));
    }

    @GetMapping("/count")
    @PreAuthorize("hasAuthority('COUNT_NOTIF')")
    public ResponseEntity<Long> countTotalNotification() {
        return ResponseEntity.ok(notificationService.countTotalNotification());
    }

    @GetMapping("/filter_by_satus")
    @PreAuthorize("hasAuthority('FILTER_NOTIF_BY_STATUS')")
    public ResponseEntity<List<Notification>> filterByStatus(@RequestParam(name = "status") Boolean readStatus) {
        return ResponseEntity.ok(notificationService.filterByStatus(readStatus));
    }

    @PostMapping("/mark_all_as_read")
    @PreAuthorize("hasAuthority('MARK_ALL_NOTIF_AS_READ')")
    public ResponseEntity<String> markAllAsRead() {
        return ResponseEntity.ok(notificationService.markAllAsRead());
    }
}
