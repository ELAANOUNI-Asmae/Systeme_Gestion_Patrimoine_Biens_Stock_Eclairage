package ma.project.sgpbse.dto.publicLighting.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor

public class InterventionRequestDto {

    private LocalDateTime interventionDate;
    private String description;
    private Long technician_id;
}
