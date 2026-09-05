package ma.project.sgpbse.entity.publicLighting;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import ma.project.sgpbse.enums.LightPointStatus;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@Entity
@Table(name = "lightPoint")
public class LightPoint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String designation_fr;
    private String designation_ar;
    private String location;
    private Double power;
    private Double latitude;
    private Double longitude;
    private LocalDate installationDate;
    private LightPointStatus lightPointStatus;

    @OneToMany(mappedBy = "lightPoint")
    private List<Failure> failureList;
}
