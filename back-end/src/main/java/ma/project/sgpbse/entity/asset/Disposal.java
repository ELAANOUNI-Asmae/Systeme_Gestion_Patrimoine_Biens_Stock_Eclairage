package ma.project.sgpbse.entity.asset;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ma.project.sgpbse.enums.DisposalMethod;

import java.time.LocalDate;
import java.util.List;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor

@Entity
@Table(name = "disposal")
public class Disposal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate disposalDate;
    private Double amount;

    @OneToMany(mappedBy = "disposal")
    private List<Document> documentList;

    @Enumerated(EnumType.STRING)
    private DisposalMethod disposalMethod;
    private String purchaser;

    @OneToOne(mappedBy = "disposal")
    private Asset asset;
}
