package ma.project.sgpbse.entity.stock;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import ma.project.sgpbse.entity.Notification;

import java.time.LocalDate;
@Builder
@Getter
@Setter
@Entity
@Table(name = "lowStockAlert")
public class LowStockAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id")
    private Item item;
    private boolean resolved = false; // ou isResolved

    private Long quantity;
    private LocalDate createdAt;
    private String message;

}
