package ma.project.sgpbse.entity.publicLighting;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ma.project.sgpbse.entity.asset.Document;
import ma.project.sgpbse.enums.LightPointStatus;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@Entity
@Table(name = "lightPoint")
public class LightPoint {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String reference;
    private String designation_fr;
    private String designation_ar;
    private String location;
    private Double power;
    private Double latitude;
    private Double longitude;
    private LocalDate installationDate;
    private LightPointStatus lightPointStatus;

    @OneToMany(mappedBy = "lightPoint", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Failure> failureList = new ArrayList<>();

    @OneToMany(mappedBy = "lightPoint", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Document> documentSet = new LinkedHashSet<>();
}
