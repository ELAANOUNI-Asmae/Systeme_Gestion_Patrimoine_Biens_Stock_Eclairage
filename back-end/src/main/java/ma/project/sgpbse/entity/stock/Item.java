package ma.project.sgpbse.entity.stock;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
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
@AllArgsConstructor
@Entity
@Table(name = "item")
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String reference;
    private String name;
    private String designationAr;
    private String serialNumber;
    private String category;
    private String categoryAr;
    private Long alertThreshold;
    private String unit;
    private String brand;
    private Long quantity = 0L;
    private String location_fr;
    private String location_ar;
    private Double price;
    private Double vatRate;
    private LocalDate updatedAt;

    @OneToMany(mappedBy = "item")
    private List<ItemRequest> itemRequestList = new ArrayList<>();

    @OneToMany(mappedBy = "item")
    private List<StockMovement> stockMovementList = new ArrayList<>();

    @OneToMany(mappedBy = "item")
    private List<LowStockAlert> lowStockAlertList = new ArrayList<>();

    @OneToMany(mappedBy = "item")
    private List<Document> documentList = new ArrayList<>();
}
