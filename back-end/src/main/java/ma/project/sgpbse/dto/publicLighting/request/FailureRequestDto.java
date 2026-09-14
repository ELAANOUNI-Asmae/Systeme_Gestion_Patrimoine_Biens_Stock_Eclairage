package ma.project.sgpbse.dto.publicLighting.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class FailureRequestDto {
    private String description;
    private String location;
    private Long lightPointId;
    private String reportedBy;
}
