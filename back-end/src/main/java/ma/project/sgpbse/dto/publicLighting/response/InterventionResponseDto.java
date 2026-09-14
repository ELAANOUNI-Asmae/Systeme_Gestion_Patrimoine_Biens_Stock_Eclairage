package ma.project.sgpbse.dto.publicLighting.response;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ma.project.sgpbse.enums.InterventionStatus;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter @Setter @NoArgsConstructor
public class InterventionResponseDto {
    private Long id;
    private Long failureId;
    private Long technicianId;
    private String technician_name;
    private String technician_name_ar;
    private String technicianLocalisation;
    private LocalDateTime interventionDate;
    private String description;
    private Double cost;
    private InterventionStatus status;
    private LocalDateTime completedAt;
    private String report;
    private List<LightingDocumentResponseDto> documents = new ArrayList<>();
}
