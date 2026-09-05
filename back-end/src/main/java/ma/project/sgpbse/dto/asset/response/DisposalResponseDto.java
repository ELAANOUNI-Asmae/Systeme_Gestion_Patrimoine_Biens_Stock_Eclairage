package ma.project.sgpbse.dto.asset.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import ma.project.sgpbse.enums.DisposalMethod;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class DisposalResponseDto {


    private LocalDate disposalDate;
    private Double amount;
    private List<DocumentResponseDto> documentResponseDtos;
    private DisposalMethod disposalMethod;
    private String purchaser;
    private String asset_name;
}
