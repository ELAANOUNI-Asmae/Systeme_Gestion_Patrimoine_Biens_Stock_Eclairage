package ma.project.sgpbse.dto.publicLighting.request;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor
public class InterventionCompletionRequestDto {
    private String report;
    private Double cost;
    private LocalDateTime completedAt;
}
