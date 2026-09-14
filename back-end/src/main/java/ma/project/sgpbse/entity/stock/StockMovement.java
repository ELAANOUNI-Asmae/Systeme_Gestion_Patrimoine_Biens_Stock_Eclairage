package ma.project.sgpbse.entity.stock;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ma.project.sgpbse.entity.asset.Document;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "stock_mov_type", discriminatorType = DiscriminatorType.STRING)
public abstract class StockMovement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private LocalDate mouvementDate;
    private Long quantity;
    private String reason;
    private String performedBy;
    private String partnerName;
    private String operationReference;
    private Double unitPriceSnapshot;
    private Double vatSnapshot;
    private Long supplyRequestId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id")
    private Item item;

    @OneToMany(mappedBy = "stockMovement")
    private List<Document> stockMovementDocuments = new ArrayList<>();
}
