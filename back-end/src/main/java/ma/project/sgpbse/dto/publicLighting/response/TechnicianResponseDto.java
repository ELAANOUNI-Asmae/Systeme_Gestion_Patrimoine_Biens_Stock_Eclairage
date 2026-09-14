package ma.project.sgpbse.dto.publicLighting.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class TechnicianResponseDto {
    private Long id;
    private String name;
    private String nameAr;
    private String phone;
    private String localisation;
    private Double latitude;
    private Double longitude;
    private boolean active;
}
