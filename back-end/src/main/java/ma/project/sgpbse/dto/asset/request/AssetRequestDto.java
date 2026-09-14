package ma.project.sgpbse.dto.asset.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import ma.project.sgpbse.enums.AssetStatus;

import java.time.LocalDate;

@Getter
@Setter

public abstract class AssetRequestDto {

    @NotNull(message = "Le nr d'inventaire est obligatoire !")
    private String inventoryNumber;

    @NotNull(message = "La désignation est obligatoire !")
    private String designation;

    @NotNull(message = "La date d'acquésition est obligatoire !")
    private LocalDate acquisitionDate;

    @NotNull(message = "La valeur d'acquésition est obligatoire !")
    private Double acquisitionValue;

    @NotNull(message = "L'affectation' est obligatoire !")
    private String assignment;
}
