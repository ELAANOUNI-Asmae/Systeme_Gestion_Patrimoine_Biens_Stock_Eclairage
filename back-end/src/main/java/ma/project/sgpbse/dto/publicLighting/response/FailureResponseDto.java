package ma.project.sgpbse.dto.publicLighting.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import ma.project.sgpbse.enums.FailureStatus;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
public class FailureResponseDto {

    private LocalDateTime reportDate;
    private String description;
    private String location;
    private FailureStatus failureStatus;
}
