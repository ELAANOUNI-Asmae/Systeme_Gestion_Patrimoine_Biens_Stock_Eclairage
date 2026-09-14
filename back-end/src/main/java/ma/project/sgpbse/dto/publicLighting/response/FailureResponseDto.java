package ma.project.sgpbse.dto.publicLighting.response;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ma.project.sgpbse.enums.FailureStatus;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter @Setter @NoArgsConstructor
public class FailureResponseDto {
    private Long id;
    private Long lightPointId;
    private String lightReference;
    private String lightDesignation_fr;
    private String lightDesignation_ar;
    private LocalDateTime reportDate;
    private String description;
    private String location;
    private String reportedBy;
    private FailureStatus failureStatus;
    private String workflowStatus;
    private List<LightingDocumentResponseDto> documents = new ArrayList<>();
}
