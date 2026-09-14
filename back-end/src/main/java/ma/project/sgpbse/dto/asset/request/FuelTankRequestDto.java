package ma.project.sgpbse.dto.asset.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
public class FuelTankRequestDto {

    @NotBlank
    private LocalDate refuelingDate;
    @NotBlank
    private Double amount;
}
