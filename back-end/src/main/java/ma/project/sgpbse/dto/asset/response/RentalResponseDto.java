package ma.project.sgpbse.dto.asset.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.Set;

@Getter
@Setter
@AllArgsConstructor
public class RentalResponseDto {

    private String assetName;
    private LocalDate startDate;
    private LocalDate endDate;
    private Long frequency;
    private Double amount;
    private String tenantName;
    private Set<DocumentResponseDto> documentResponseDtoSet;

}
