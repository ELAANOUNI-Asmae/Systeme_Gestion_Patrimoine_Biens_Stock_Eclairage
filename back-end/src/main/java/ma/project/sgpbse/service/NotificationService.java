package ma.project.sgpbse.service;

import lombok.RequiredArgsConstructor;
import ma.project.sgpbse.entity.Notification;
import ma.project.sgpbse.entity.user.User;
import ma.project.sgpbse.repository.NotificationRepository;
import ma.project.sgpbse.repository.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    /**
     * CAS 1 : Notification directe (Sender -> Receiver)
     */
    @Transactional
    public Notification sendDirectNotification(User sender, User receiver, String title, String message) {
        Notification notification = Notification.builder()
                .title(title)
                .message(message)
                .createdAt(LocalDateTime.now())
                .readStatus(false)
                .sender(sender)
                .receiver(receiver)
                .build();

        return notificationRepository.save(notification);
    }

    /**
     * CAS 2 : Notification système basée sur UNE SEULE permission (sender = null)
     */
    @Transactional
    public void notifyUsersWithPermission(String permissionName, String title, String message) {
        if (permissionName == null || permissionName.isBlank()) {
            return;
        }

        List<User> targetUsers = userRepository.findAllByPermissionName(permissionName);

        for (User receiver : targetUsers) {
            Notification notification = Notification.builder()
                    .title(title)
                    .message(message)
                    .createdAt(LocalDateTime.now())
                    .readStatus(false)
                    .sender(null) // Système
                    .receiver(receiver)
                    .build();

            notificationRepository.save(notification);
        }
    }

    @Transactional
    public String markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification introuvable avec l'ID : " + notificationId));
        notification.setReadStatus(true);
        notificationRepository.save(notification);

        return "Success !";
    }

    //count total notifications
    @Transactional
    public Long countTotalNotification(){
        return notificationRepository.count();
    }

    //filter notification by status
    @Transactional
    public List<Notification> filterByStatus(Boolean readStatus){
        return notificationRepository.findAllByReadStatus(readStatus);
    }

    //markAll as read
    @Transactional
    public String markAllAsRead(){
        List<Notification> notifications = notificationRepository.findAll();
        for (Notification notification : notifications) {
            notification.setReadStatus(true);
        }

        return "Success !";
    }

}