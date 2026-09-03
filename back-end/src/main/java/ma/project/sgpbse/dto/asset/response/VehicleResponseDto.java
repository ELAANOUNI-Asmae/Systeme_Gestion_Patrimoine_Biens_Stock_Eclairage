package ma.project.sgpbse.dto.asset.response;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Data
@EqualsAndHashCode(callSuper = true)
public class VehicleResponseDto extends AssetResponseDto{

    private String registrationNumber;
    private String chassisNumber;
    private String make;
    private int fiscalHorsepower;
    private LocalDate firstRegistrationDate;
    private Long odometer;
    private int manufactureYear;
}
