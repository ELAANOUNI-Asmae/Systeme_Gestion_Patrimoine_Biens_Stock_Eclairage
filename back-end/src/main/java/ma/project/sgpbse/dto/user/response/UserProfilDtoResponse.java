package ma.project.sgpbse.dto.user.response;

import lombok.*;
import ma.project.sgpbse.entity.user.Role;
import ma.project.sgpbse.enums.AccountStatus;
import ma.project.sgpbse.enums.Gender;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfilDtoResponse {

    private Long id;

    private String email;

    private String firstname_fr;
    private String lastname_fr;

    private String firstname_ar;
    private String lastname_ar;

    private String fullname_fr;
    private String fullname_ar;

    private Gender gender;

    private String phone;

    private String cin;

    private AccountStatus accountStatus;

    private Role role;
}