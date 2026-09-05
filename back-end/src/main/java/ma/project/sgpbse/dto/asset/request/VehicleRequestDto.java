package ma.project.sgpbse.dto.asset.request;


import lombok.Getter;
import lombok.NonNull;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class VehicleRequestDto extends AssetRequestDto{

    @NonNull
    private String registrationNumber;
    @NonNull
    private String chassisNumber;
    @NonNull
    private String make;
    private int fiscalHorsepower;
    @NonNull
    private LocalDate firstRegistrationDate;
    private Long odometer;
    private int manufactureYear;

}
