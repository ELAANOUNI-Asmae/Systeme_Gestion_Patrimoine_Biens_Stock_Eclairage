package ma.project.sgpbse.entity.asset;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import ma.project.sgpbse.entity.DueDate;
import ma.project.sgpbse.enums.DocumentType;

@Getter
@Setter

@Entity
@Table(name = "document")
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DocumentType documentType;

    @Column(unique = true)
    private String path;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id")
    private Asset asset;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maintenance_id")
    private Maintenance maintenance;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rental_id")
    private Rental rental;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "accident_id")
    private Accident accident;

    @OneToOne(mappedBy = "document", cascade = CascadeType.ALL, orphanRemoval = true)
    private DueDate dueDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fuelTank_id")
    private FuelTank fuelTank;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "disposal_id")
    private Disposal disposal;


}
