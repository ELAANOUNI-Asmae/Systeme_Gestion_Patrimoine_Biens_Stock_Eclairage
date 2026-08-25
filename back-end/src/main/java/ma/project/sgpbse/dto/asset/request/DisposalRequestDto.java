package ma.project.sgpbse.dto.asset.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import ma.project.sgpbse.enums.DisposalMethod;
import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor

public class DisposalRequestDto {

    @NotBlank
    private LocalDate disposalDate;
    @NotBlank
    private Double amount;
    @NotBlank
    private DisposalMethod disposalMethod;
    @NotBlank
    private String purchaser;

}
