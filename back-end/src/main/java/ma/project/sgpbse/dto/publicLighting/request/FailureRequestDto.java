package ma.project.sgpbse.dto.publicLighting.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class FailureRequestDto {

    private String description;
    private String location;

}
