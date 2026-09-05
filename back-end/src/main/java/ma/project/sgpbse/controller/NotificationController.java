package ma.project.sgpbse.controller;

import lombok.AllArgsConstructor;
import ma.project.sgpbse.entity.Notification;
import ma.project.sgpbse.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@AllArgsConstructor

@RestController
@RequestMapping("/sgpbse/notif")
public class NotificationController {

    @Autowired
    private final NotificationService  notificationService;

    @PostMapping("/mark_as_read/{notif_id}")
    @PreAuthorize("hasAuthority('MARK_NOTIF_AS_READ')")
    public ResponseEntity<String> markAsRead(@PathVariable Long notif_id) {
        return ResponseEntity.ok(notificationService.markAsRead(notif_id));
    }

    //count total notifications
    @GetMapping("/count")
    @PreAuthorize("hasAuthority('COUNT_NOTIF')")
    public ResponseEntity<Long> countTotalNotification(){
        return ResponseEntity.ok(notificationService.countTotalNotification());
    }

    //filter notification by status
    @GetMapping("/filter_by_satus")
    @PreAuthorize("hasAuthority('FILTER_NOTIF_BY_STATUS')")
    public ResponseEntity<List<Notification>> filterByStatus(@RequestPart(name = "status") Boolean readStatus){
        return ResponseEntity.ok(notificationService.filterByStatus(readStatus));
    }

    //markAll as read
    @PostMapping("/mark_all_as_read")
    @PreAuthorize("hasAuthority('MARK_ALL_NOTIF_AS_READ')")
    public ResponseEntity<String> markAllAsRead(){
        return ResponseEntity.ok(notificationService.markAllAsRead());
    }
}
