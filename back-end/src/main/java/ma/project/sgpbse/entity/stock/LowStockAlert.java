package ma.project.sgpbse.entity.stock;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "lowStockAlert")
public class LowStockAlert {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id")
    private Item item;
    private boolean resolved;
    private Long quantity;
    private LocalDate createdAt;
    private String message;

    private boolean manualRequest;
    private Long requestedQuantity;
    private Long requesterId;
    private String requesterName;
    private String reason;
    private LocalDate readyNotifiedAt;
}
