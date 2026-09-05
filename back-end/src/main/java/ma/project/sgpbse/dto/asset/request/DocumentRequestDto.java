package ma.project.sgpbse.dto.asset.request;

import lombok.Getter;
import lombok.Setter;
import ma.project.sgpbse.enums.DocumentType;

import java.time.LocalDate;

@Getter
@Setter
public class DocumentRequestDto {

    private String title_fr;
    private String title_ar;
    private String path;
    private DocumentType documentType;
    private String type;
    private LocalDate endDate;
    private Integer alertThreshold;


}
