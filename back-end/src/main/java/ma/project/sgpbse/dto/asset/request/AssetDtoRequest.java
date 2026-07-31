package ma.project.sgpbse.dto.asset.request;


import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import ma.project.sgpbse.enums.AssetStatus;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class AssetDtoRequest {

    @NotBlank(message = "La désignation est obligatoire !")
    @NotNull
    private String designation;

    @NotBlank(message = "Le status est obligatoire !")
    @NotNull
    private AssetStatus assetStatus;

    @JsonFormat(pattern = "yyyy-MM-dd")
    @NotNull
    private LocalDate acuesition_date;

    @NotBlank(message = "La valeur d'acquésition est obligatoire !")
    @NotNull
    private Double purchase_value;

    @NotBlank(message = "L'affectation est obligatoire !")
    @NotNull
    private String assignement;

    @NotBlank(message = "L'inventaire est obligatoire !")
    @NotNull
    private String inventory_id;
}
