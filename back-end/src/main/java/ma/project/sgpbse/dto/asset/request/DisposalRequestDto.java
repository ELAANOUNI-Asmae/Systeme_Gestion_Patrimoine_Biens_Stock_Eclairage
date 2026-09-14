package ma.project.sgpbse.dto.asset.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import ma.project.sgpbse.enums.DisposalMethod;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
public class DisposalRequestDto {

    @NotNull
    private LocalDate disposalDate;

    @NotNull
    private Double amount;

    @NotNull
    private DisposalMethod disposalMethod;

    @NotBlank
    private String purchaser;
}