package ma.project.sgpbse.test;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record CreateCDto(
        @NotBlank String nom,
        @NotNull @Positive Integer nombreSpecifiqueC
) {}
