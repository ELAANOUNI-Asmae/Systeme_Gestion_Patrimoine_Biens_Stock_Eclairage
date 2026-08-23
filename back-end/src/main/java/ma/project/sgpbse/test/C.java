package ma.project.sgpbse.test;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.Setter;

// Entité Fille C
@Entity @DiscriminatorValue("TYPE_C") @Getter @Setter
public class C extends A {
    private Integer nombreSpecifiqueC;
}
