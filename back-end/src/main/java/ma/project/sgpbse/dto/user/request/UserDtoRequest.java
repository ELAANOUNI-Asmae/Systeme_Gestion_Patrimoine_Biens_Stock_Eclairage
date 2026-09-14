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

    @NotBlank(message = "L'email est obligatoire !")
    @Email(message = "Adresse e-mail invalide")
    private String email;

    @Size(
            min = 3,
            max = 50,
            message = "Le prénom doit contenir entre 3 et 50 caractères"
    )
    @NotBlank(message = "Le prénom est obligatoire !")
    private String firstname_fr;

    @Size(
            min = 3,
            max = 50,
            message = "Le prénom arabe doit contenir entre 3 et 50 caractères"
    )
    @NotBlank(message = "Le prénom arabe est obligatoire !")
    private String firstname_ar;

    @Size(
            min = 3,
            max = 50,
            message = "Le nom doit contenir entre 3 et 50 caractères"
    )
    @NotBlank(message = "Le nom est obligatoire !")
    private String lastname_fr;

    @Size(
            min = 3,
            max = 50,
            message = "Le nom arabe doit contenir entre 3 et 50 caractères"
    )
    @NotBlank(message = "Le nom arabe est obligatoire !")
    private String lastname_ar;

    @NotNull(message = "Le genre est obligatoire !")
    private Gender gender;

    @NotBlank(message = "Le n° de téléphone est obligatoire !")
    @Pattern(
            regexp = "^(0[5-7])[0-9]{8}$",
            message = "Invalid Moroccan phone number"
    )
    private String phone;

    @NotBlank(message = "Le n° de CIN est obligatoire !")
    @Pattern(
            regexp = "^[A-Z]{1,2}[0-9]{5,6}$",
            message = "Invalid Moroccan CIN"
    )
    private String cin;

    /*
     * Obligatoire pendant la création.
     * Facultatif pendant la modification d'un utilisateur.
     *
     * Les contraintes Size/Pattern acceptent null.
     * UserService vérifie explicitement sa présence
     * lors de createUser().
     */
    @Size(
            min = 8,
            max = 50,
            message = "Le mot de passe doit contenir entre 8 et 50 caractères"
    )
    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&]).+$",
            message = "Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial"
    )
    private String pwd;

    @NotNull(message = "Le rôle est obligatoire !")
    private Role role;
}