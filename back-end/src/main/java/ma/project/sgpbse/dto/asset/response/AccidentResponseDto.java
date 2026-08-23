package ma.project.sgpbse.dto.asset.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class AccidentResponseDto {

    private String description;
    private Double penalityCost;
    private String driverName;
    private String vehiculeName;
    private List<DocumentResponseDto> documentResponseDtoList;
}
