package ma.project.sgpbse.entity.publicLighting;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import ma.project.sgpbse.entity.asset.Document;
import ma.project.sgpbse.enums.FailureStatus;

import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.Set;

@Getter @Setter
@Entity
@Table(name = "failure")
public class Failure {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private LocalDateTime reportDate;
    private String description;
    private String reportedBy;
    private FailureStatus failureStatus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lightPoint_id")
    private LightPoint lightPoint;

    @OneToOne(mappedBy = "failure", cascade = CascadeType.ALL, orphanRemoval = true)
    private Intervention intervention;

    @OneToMany(mappedBy = "failure", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Document> documentSet = new LinkedHashSet<>();
}
