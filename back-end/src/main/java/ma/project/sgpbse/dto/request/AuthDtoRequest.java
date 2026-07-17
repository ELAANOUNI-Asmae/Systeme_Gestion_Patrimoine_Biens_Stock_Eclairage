package ma.project.sgpbse.dto.request;
import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class AuthDtoRequest {

    @NotNull(message = "L'email est obligatoire !")
    @Email private String email;

    @NotBlank(message = "Le mot de passe est obligatoire")
    private String pwd;

}
