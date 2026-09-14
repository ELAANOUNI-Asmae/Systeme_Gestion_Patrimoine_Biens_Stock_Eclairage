package ma.project.sgpbse.dto.user.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class RoleRequestDto {

    @NotBlank(message = "Le nom doit être non vide")
    @NotNull
    private String name;

    @NotNull(message = "La liste des permissions ne doit pas être nulle")
    @NotEmpty(message = "Il faut spécifier au moins une permission")
    private List<Long> permission_ids;

}
