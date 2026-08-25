package ma.project.sgpbse.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import ma.project.sgpbse.entity.asset.Document;

import java.time.LocalDate;

@Entity
@Table(name = "due-date")
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

    private Boolean isTreated = false;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false, unique = true)
    private Document document;
}
