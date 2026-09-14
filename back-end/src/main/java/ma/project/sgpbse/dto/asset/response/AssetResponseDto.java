package ma.project.sgpbse.dto.asset.response;

import lombok.*;
import ma.project.sgpbse.enums.AssetStatus;

import java.time.LocalDate;
import java.util.Set;

@Getter
@Setter
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AssetResponseDto {

    private Long id;

    private String inventoryNumber;

    private String designation;

    private AssetStatus assetStatus;

    private LocalDate acquisitionDate;

    private Double purchaseValue;

    private String assignment;

    private LocalDate archivedAt;

    private Set<DocumentResponseDto> documentResponseDtoSet;
}