package ma.project.sgpbse.test;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

// Entité Mère Abstraite - Pure structure de données
@Entity
@Table(name = "table_a")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "type_code", discriminatorType = DiscriminatorType.STRING)
@Getter @Setter
public abstract class A {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;
    private String statut;
}