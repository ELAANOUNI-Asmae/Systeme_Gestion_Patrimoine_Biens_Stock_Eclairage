package ma.project.sgpbse.dto.asset.response;

import lombok.Getter;
import lombok.Setter;
import ma.project.sgpbse.enums.DocumentType;

import java.time.LocalDate;

@Getter
@Setter
public class DocumentResponseDto {

    private Long id;

    private String title_fr;
    private String title_ar;

    private DocumentType documentType;
    private String type;

    private String path;

    private LocalDate endDate;
    private Integer alertThreshold;
}