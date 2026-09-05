package ma.project.sgpbse.entity.publicLighting;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import ma.project.sgpbse.entity.asset.Document;
import ma.project.sgpbse.entity.user.User;
import ma.project.sgpbse.enums.InterventionStatus;
import java.time.LocalDateTime;
import java.util.Set;

@Getter
@Setter
@AllArgsConstructor

@Entity
@Table(name = "intervention")
public class Intervention {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime interventionDate;
    private String description;
    private Double cost;
    private InterventionStatus status;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User technician;

    @OneToMany(mappedBy = "intervention")
    private Set<Document> documentSet;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "failure_id", referencedColumnName = "id")
    private Failure failure;


}
