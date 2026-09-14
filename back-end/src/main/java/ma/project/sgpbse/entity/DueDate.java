package ma.project.sgpbse.entity;

import jakarta.persistence.*;
import lombok.*;
import ma.project.sgpbse.entity.asset.Document;

import java.time.LocalDate;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "due_dates")
@Getter
@Setter
public class DueDate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false)
    private LocalDate endDate;

    private Long margin;

    private String message;

    @Builder.Default
    private Boolean treated = false;

    // Seuil d'alerte spécifique à cette échéance (ex: 30 jours, 15 jours)
    @Column(nullable = false)
    private Integer thresholdDays; // Valeur par défaut : 30 jours

    // Une seule permission ciblée pour l'alerte
    @Column(name = "target_permission")
    private String targetPermission;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false, unique = true)
    private Document document;
}