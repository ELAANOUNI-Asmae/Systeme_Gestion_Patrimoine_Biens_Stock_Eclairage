package ma.project.sgpbse.entity.asset;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ma.project.sgpbse.enums.AssetStatus;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor

@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "asset_type", discriminatorType = DiscriminatorType.STRING)
@SQLRestriction("status <> 'ARCHIVED'")
public abstract class Asset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String designation;
    private AssetStatus assetStatus;
    private LocalDate acquisition_date;
    private Double purchase_value;
    private String assignment;
    private String inventory_id;

    @OneToOne
    @JoinColumn(name = "disposal_id")
    private Disposal disposal;

    @OneToMany(mappedBy = "asset", cascade = CascadeType.ALL)
    private Set<Document> documents;

    @OneToMany(mappedBy = "asset")
    private List<Maintenance> maintenanceList;

    @OneToMany(mappedBy = "asset")
    private List<Rental> rentalList;
}
