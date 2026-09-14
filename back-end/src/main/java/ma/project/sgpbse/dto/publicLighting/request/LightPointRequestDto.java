package ma.project.sgpbse.dto.publicLighting.request;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor
public class LightPointRequestDto {
    private String reference;
    private String designation_fr;
    private String designation_ar;
    private String gpsLocation;
    private String lampType;
    private Double power;
    private Double latitude;
    private Double longitude;
    private LocalDate installationDate;
    private String location;
}
