package ma.project.sgpbse.service;

import lombok.RequiredArgsConstructor;
import ma.project.sgpbse.dto.notification.NotificationResponseDto;
import ma.project.sgpbse.entity.Notification;
import ma.project.sgpbse.entity.user.User;
import ma.project.sgpbse.repository.NotificationRepository;
import ma.project.sgpbse.repository.user.UserRepository;
import ma.project.sgpbse.service.user.CurrentUserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;

    @Transactional
    public Notification sendDirectNotification(User sender, User receiver, String title, String message) {
        if (receiver == null) {
            throw new IllegalArgumentException("NOTIFICATION_RECEIVER_REQUIRED");
        }

        Notification notification = Notification.builder()
                .title(title == null ? "Notification" : title)
                .message(message == null ? "" : message)
                .createdAt(LocalDateTime.now())
                .readStatus(false)
                .sender(sender)
                .receiver(receiver)
                .build();

        return notificationRepository.save(notification);
    }

    @Transactional
    public void notifyUsersWithPermission(String permissionName, String title, String message) {
        if (permissionName == null || permissionName.isBlank()) {
            return;
        }

        List<User> targetUsers = userRepository.findAllByPermissionName(permissionName);
        for (User receiver : targetUsers) {
            sendDirectNotification(null, receiver, title, message);
        }
    }

    @Transactional(readOnly = true)
    public List<NotificationResponseDto> getCurrentUserNotifications() {
        User current = currentUserService.getCurrentUser();
        return notificationRepository
                .findByReceiver_IdOrderByCreatedAtDesc(current.getId())
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public Long countUnreadCurrentUserNotifications() {
        User current = currentUserService.getCurrentUser();
        return notificationRepository.countByReceiver_IdAndReadStatusFalse(current.getId());
    }

    @Transactional
    public NotificationResponseDto markCurrentUserAsRead(Long notificationId) {
        Notification notification = getOwnedNotification(notificationId);
        notification.setReadStatus(true);
        return toDto(notificationRepository.save(notification));
    }

    @Transactional
    public void markAllCurrentUserAsRead() {
        User current = currentUserService.getCurrentUser();
        List<Notification> notifications = notificationRepository
                .findByReceiver_IdAndReadStatusOrderByCreatedAtDesc(current.getId(), false);
        for (Notification notification : notifications) {
            notification.setReadStatus(true);
        }
        notificationRepository.saveAll(notifications);
    }

    @Transactional
    public void deleteCurrentUserNotification(Long notificationId) {
        notificationRepository.delete(getOwnedNotification(notificationId));
    }

    private Notification getOwnedNotification(Long notificationId) {
        User current = currentUserService.getCurrentUser();
        return notificationRepository.findByIdAndReceiver_Id(notificationId, current.getId())
                .orElseThrow(() -> new IllegalArgumentException("NOTIFICATION_NOT_FOUND"));
    }

    private NotificationResponseDto toDto(Notification notification) {
        User sender = notification.getSender();
        String senderName = null;
        Long senderId = null;
        if (sender != null) {
            senderId = sender.getId();
            senderName = ((sender.getFirstname_fr() == null ? "" : sender.getFirstname_fr()) + " " +
                    (sender.getLastname_fr() == null ? "" : sender.getLastname_fr())).trim();
        }

        return new NotificationResponseDto(
                notification.getId(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getCreatedAt(),
                Boolean.TRUE.equals(notification.getReadStatus()),
                senderId,
                senderName
        );
    }

    // Legacy endpoints kept for compatibility with existing callers.
    @Transactional
    public String markAsRead(Long notificationId) {
        markCurrentUserAsRead(notificationId);
        return "Success !";
    }

    @Transactional(readOnly = true)
    public Long countTotalNotification() {
        return countUnreadCurrentUserNotifications();
    }

    @Transactional(readOnly = true)
    public List<Notification> filterByStatus(Boolean readStatus) {
        User current = currentUserService.getCurrentUser();
        return notificationRepository.findByReceiver_IdAndReadStatusOrderByCreatedAtDesc(
                current.getId(),
                Boolean.TRUE.equals(readStatus)
        );
    }

    @Transactional
    public String markAllAsRead() {
        markAllCurrentUserAsRead();
        return "Success !";
    }
}
