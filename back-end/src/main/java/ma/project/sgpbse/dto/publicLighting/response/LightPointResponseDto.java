package ma.project.sgpbse.dto.publicLighting.response;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ma.project.sgpbse.enums.LightPointStatus;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter @Setter @NoArgsConstructor
public class LightPointResponseDto {
    private Long id;
    private String reference;
    private String designation_fr;
    private String designation_ar;
    private String lampType;
    private Double power;
    private LocalDate installationDate;
    private String location;
    private Double latitude;
    private Double longitude;
    private LightPointStatus lightPointStatus;
    private List<LightingDocumentResponseDto> documents = new ArrayList<>();
}
