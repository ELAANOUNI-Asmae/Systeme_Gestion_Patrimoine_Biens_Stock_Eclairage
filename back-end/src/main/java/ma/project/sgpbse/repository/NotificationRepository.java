package ma.project.sgpbse.repository;

import ma.project.sgpbse.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByReceiver_IdAndReadStatusFalse(Long receiverId);
    List<Notification> findByReceiver_IdOrderByCreatedAtDesc(Long receiverId);
    List<Notification> findAllByReadStatus(Boolean readStatus);

}
