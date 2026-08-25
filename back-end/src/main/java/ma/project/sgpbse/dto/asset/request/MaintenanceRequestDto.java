package ma.project.sgpbse.dto.asset.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor

public class MaintenanceRequestDto {

    @NotNull
    private String maintenanceType;
    @NotNull
    private LocalDate scheduledDate;

}
