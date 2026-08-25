package ma.project.sgpbse.test;

import jakarta.validation.constraints.NotBlank;

public record CreateBDto(
        @NotBlank String nom,
        @NotBlank String donneeSpecifiqueB
) {}
