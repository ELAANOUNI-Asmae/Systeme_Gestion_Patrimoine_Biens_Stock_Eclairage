package ma.project.sgpbse.entity.stock;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
@Getter
@Setter
@AllArgsConstructor
@Entity
@Table(name = "item")
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String serialNumber;
    private Long alertThreshold;
    private String unit;
    private String brand;
    private Long quantity;
    private String location_fr;
    private String location_ar;

    @OneToMany(mappedBy = "item")
    private List<ItemRequest> itemRequestList;

    @OneToMany(mappedBy = "item")
    private List<StockMovement> stockMovementList;

    @OneToMany(mappedBy = "item")
    private List<LowStockAlert> lowStockAlertList;

}
