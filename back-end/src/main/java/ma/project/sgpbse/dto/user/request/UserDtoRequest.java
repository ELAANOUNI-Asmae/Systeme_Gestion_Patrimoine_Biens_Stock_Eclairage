package ma.project.sgpbse.dto.user.request;

import jakarta.validation.constraints.*;
import lombok.*;
import ma.project.sgpbse.entity.user.Role;
import ma.project.sgpbse.enums.Gender;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class UserDtoRequest {

    @NotBlank(message = "L'email'est obligatoire !")
    @NotNull
    @Email private String email;

    @Size(min = 3, max = 50, message = "Le prénom doit contenir au moins 3 caractère")
    @NotBlank(message = "Le prénom est obligatoire !")
    @NotNull
    private String firstname_fr;

    @Size(min = 3, max = 50, message = "Le prénom doit contenir au moins 3 caractère")
    @NotBlank(message = "Le prénom est obligatoire !")
    @NotNull
    private String firstname_ar;

    @Size(min = 3, max = 50, message = "Le nom doit contenir au moins 3 caractère")
    @NotBlank(message = "Le nom est obligatoire !")
    @NotNull
    private String lastname_fr;

    @Size(min = 3, max = 50, message = "Le nom doit contenir au moins 3 caractère")
    @NotBlank(message = "Le nom est obligatoire !")
    @NotNull
    private String lastname_ar;

    private Gender gender;

    @NotBlank(message = "Le n° de téléphone est obligatoire !")
    @NotNull
    @Pattern(
            regexp = "^(0[5-7])[0-9]{8}$",
            message = "Invalid Moroccan phone number"
    )
    private String phone;

    @NotBlank(message = "Le n° de CIN est obligatoire !")
    @NotNull
    @Pattern(
            regexp = "^[A-Z]{1,2}[0-9]{5,6}$",
            message = "Invalid Moroccan CIN"
    )
    private String cin;
    @NotBlank(message = "Le mot de passe est obligatoire !")
    @NotNull
    private String serviceName;

    @NotBlank(message = "Le mot de passe est obligatoire !")
    @NotNull
    @Size(min = 8, max = 50, message = "Le mot de passe doit contenir entre 8 et 50 caractères")
    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&]).+$",
            message = "Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial"
    )
    private String pwd;

    private Role role;

}
