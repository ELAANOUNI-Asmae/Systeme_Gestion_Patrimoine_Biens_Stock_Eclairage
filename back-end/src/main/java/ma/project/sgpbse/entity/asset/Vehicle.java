package ma.project.sgpbse.entity.asset;

import jakarta.persistence.CascadeType;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter

@Entity
@DiscriminatorValue("VEHICLE")
public class Vehicle extends Asset{

    //specific attributs for vehicles
    private String registrationNumber;
    private String chassisNumber;
    private String make;
    private int fiscalHorsepower;
    private LocalDate firstRegistrationDate;
    private int manufactureYear;

    @OneToMany(mappedBy = "vehicle", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Accident> accidents;

    @OneToMany(mappedBy = "vehicle", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FuelTank> fuelTanks;
}
