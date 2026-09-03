package ma.project.sgpbse.dto.publicLighting.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import ma.project.sgpbse.dto.asset.response.DocumentResponseDto;
import java.time.LocalDateTime;
import java.util.List;
@Getter
@Setter
@AllArgsConstructor
public class InterventionResponseDto {

    private LocalDateTime interventionDate;
    private String description;
    private Double cost;
    private String technician_name;
    private List<DocumentResponseDto> documentList;
}
