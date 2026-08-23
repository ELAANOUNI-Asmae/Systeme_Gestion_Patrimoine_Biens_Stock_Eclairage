package ma.project.sgpbse.test;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.Setter;

// Entité Fille B
@Entity @DiscriminatorValue("TYPE_B") @Getter @Setter
public class B extends A {
    private String donneeSpecifiqueB;
}
