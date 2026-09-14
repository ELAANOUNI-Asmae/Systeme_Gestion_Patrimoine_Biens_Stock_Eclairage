package ma.project.sgpbse.entity;

import jakarta.persistence.*;
import lombok.*;
import ma.project.sgpbse.entity.asset.Asset;
import ma.project.sgpbse.entity.stock.LowStockAlert;
import ma.project.sgpbse.entity.user.User;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 1000)
    private String message;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private Boolean readStatus = false; // false = non lue, true = lue

    // Destinataire de la notification (OBLIGATOIRE)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_id", nullable = false)
    private User receiver;

    // Émetteur de la notification (OPTIONNEL : NULL si émise par le système/scheduler)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id")
    private User sender;

}