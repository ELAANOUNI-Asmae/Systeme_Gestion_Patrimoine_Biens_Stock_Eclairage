package ma.project.sgpbse.dto.publicLighting.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ma.project.sgpbse.enums.DocumentType;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class LightingDocumentResponseDto {
    private Long id;
    private String title_fr;
    private String title_ar;
    private DocumentType documentType;
    private String type;
    private String path;
}
