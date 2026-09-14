package ma.project.sgpbse.dto.asset.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ma.project.sgpbse.enums.MaintenanceStatus;

import java.time.LocalDate;
import java.util.Set;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class MaintenanceResponseDto {

    private String maintenanceType;
    private LocalDate scheduledDate;
    private LocalDate startDate;
    private LocalDate endDate;
    private Double cost;
    private MaintenanceStatus maintenanceStatus;
    private Long assetId;
    private Set<DocumentResponseDto> documentResponseDtoSet;
}
