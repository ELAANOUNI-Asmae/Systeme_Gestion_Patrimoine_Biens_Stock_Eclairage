package ma.project.sgpbse.dto.asset.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor

public class AccidentRequestDto {

    @NotBlank
    private String description;
    @NotBlank
    private Double penalityCost;
    @NotBlank
    private String driverName;
}
