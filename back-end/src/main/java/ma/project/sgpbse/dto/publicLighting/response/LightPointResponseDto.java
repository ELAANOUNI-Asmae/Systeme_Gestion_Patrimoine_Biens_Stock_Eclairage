package ma.project.sgpbse.dto.publicLighting.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class LightPointResponseDto {

    private String designation_fr;
    private String designation_ar;
    private String lampType;
    private Double power;
    private LocalDate installationDate;
    private String location;

}
