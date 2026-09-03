package ma.project.sgpbse.entity.publicLighting;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import ma.project.sgpbse.enums.FailureStatus;
import java.time.LocalDateTime;

@Getter
@Setter

@Entity
@Table(name = "failure")
public class Failure {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime reportDate;
    private String description;
    private FailureStatus failureStatus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lightPoint_id")
    private LightPoint lightPoint;

    @OneToOne(mappedBy = "failure")
    private Intervention intervention;

}
