package ma.project.sgpbse.entity.asset;

import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ma.project.sgpbse.enums.AssetStatus;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public abstract class Asset {

    private Long id;
    private String designation;
    private AssetStatus assetStatus;
    private LocalDate acuesition_date;
    private Double purchase_value;
    private String assignement;
    private String inventory_id;

    @OneToOne
    @JoinColumn(name = "disposal_id")
    private Disposal disposal;

    @OneToMany(mappedBy = "asset")
    private Set<Document> documents;

    @OneToMany(mappedBy = "asset")
    private List<Maintenance> maintenanceList;

    @OneToMany(mappedBy = "asset")
    private List<Rental> rentalList;
}
