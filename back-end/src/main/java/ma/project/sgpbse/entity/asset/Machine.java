package ma.project.sgpbse.entity.asset;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.*;

@Getter
@Setter

@Entity
@DiscriminatorValue("MACHINE")
public class Machine extends Asset{

    //specific attributs for machines
    private String serialNumber;
    private String brand;
    private String model;
    private Long power;
    private String technicalRef;
}
