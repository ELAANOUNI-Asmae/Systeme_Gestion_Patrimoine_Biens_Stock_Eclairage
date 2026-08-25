package ma.project.sgpbse.entity.asset;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import ma.project.sgpbse.enums.Domain;

@Getter
@Setter

@Entity
@DiscriminatorValue("REAL_ESTATE")
public class RealEstate extends Asset{

    //specific attributs for reale estates
    private String landTitleReference;
    private String cadastralReference;
    private Double areaM2;
    private String gpsLocation;
    @Enumerated(EnumType.STRING)
    private Domain domain;
    private String realEstateType;
}
