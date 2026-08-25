package ma.project.sgpbse.dto.asset.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class FuelTankResponseDto {

    private LocalDate refuelingDate;
    private Double amount;
    private String vehicleName;
    private List<DocumentResponseDto> documentResponseDtos;
}
