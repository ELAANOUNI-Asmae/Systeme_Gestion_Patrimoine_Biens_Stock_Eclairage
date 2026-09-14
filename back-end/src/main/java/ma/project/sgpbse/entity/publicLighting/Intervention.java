package ma.project.sgpbse.entity.publicLighting;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ma.project.sgpbse.entity.asset.Document;
import ma.project.sgpbse.entity.user.User;
import ma.project.sgpbse.enums.InterventionStatus;

import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.Set;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@Entity
@Table(name = "intervention")
public class Intervention {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private LocalDateTime interventionDate;
    private String description;
    private Double cost;
    private InterventionStatus status;
    @Column(length = 4000)
    private String report;
    private LocalDateTime completedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User technician;

    @OneToMany(mappedBy = "intervention", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Document> documentSet = new LinkedHashSet<>();

    @OneToOne
    @JoinColumn(name = "failure_id", referencedColumnName = "id", unique = true)
    private Failure failure;
}
