package ma.project.sgpbse.dto.user.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SelfProfileUpdateRequest {
    @NotBlank
    @Size(max = 50)
    private String firstname_fr;

    @NotBlank
    @Size(max = 50)
    private String lastname_fr;

    @Size(max = 50)
    private String firstname_ar;

    @Size(max = 50)
    private String lastname_ar;

    @Pattern(
            regexp = "^$|^(0[5-7])[0-9]{8}$",
            message = "Numéro de téléphone marocain invalide"
    )
    private String phone;
}
