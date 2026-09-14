package ma.project.sgpbse.dto.publicLighting.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class PublicFailureSummaryDto {
    private Long id;
    private Long lightPointId;
    private String status;
}
