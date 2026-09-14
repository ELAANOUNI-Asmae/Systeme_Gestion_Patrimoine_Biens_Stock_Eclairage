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
@DiscriminatorColumn(
        name = "asset_type",
        discriminatorType = DiscriminatorType.STRING
)
@SQLRestriction("asset_status <> 7")
public abstract class Asset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String designation;

    @Column(name = "designation_ar")
    private String designationAr;

    @Enumerated(EnumType.ORDINAL)
    @Column(name = "asset_status")
    private AssetStatus assetStatus;

    @Column(name = "acquisition_date")
    private LocalDate acquisition_date;

    @Column(name = "purchase_value")
    private Double purchase_value;

    private String assignment;

    @Column(name = "assignment_ar")
    private String assignmentAr;

    @Column(name = "inventory_id")
    private String inventory_id;

    @OneToOne
    @JoinColumn(name = "disposal_id")
    private Disposal disposal;

    @OneToMany(
            mappedBy = "asset",
            cascade = CascadeType.ALL
    )
    private Set<Document> documents;

    @OneToMany(mappedBy = "asset")
    private List<Maintenance> maintenanceList;

    @OneToMany(mappedBy = "asset")
    private List<Rental> rentalList;
}