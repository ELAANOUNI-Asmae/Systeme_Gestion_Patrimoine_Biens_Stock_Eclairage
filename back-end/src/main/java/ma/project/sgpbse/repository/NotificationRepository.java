package ma.project.sgpbse.repository;

import ma.project.sgpbse.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByReceiver_IdAndReadStatusFalse(Long receiverId);
    List<Notification> findByReceiver_IdOrderByCreatedAtDesc(Long receiverId);
    List<Notification> findByReceiver_IdAndReadStatusOrderByCreatedAtDesc(Long receiverId, Boolean readStatus);
    List<Notification> findAllByReadStatus(Boolean readStatus);
    long countByReceiver_IdAndReadStatusFalse(Long receiverId);
    Optional<Notification> findByIdAndReceiver_Id(Long id, Long receiverId);
}
