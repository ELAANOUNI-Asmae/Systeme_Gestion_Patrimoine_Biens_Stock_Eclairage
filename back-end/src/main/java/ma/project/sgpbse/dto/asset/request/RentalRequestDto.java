package ma.project.sgpbse.dto.asset.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
public class RentalRequestDto {

    @NotBlank
    private LocalDate startDate;
    @NotBlank
    private LocalDate endDate;
    @NotBlank
    private Long frequency;
    @NotBlank
    private Double amount;
    @NotBlank
    private String tenantName;
}
