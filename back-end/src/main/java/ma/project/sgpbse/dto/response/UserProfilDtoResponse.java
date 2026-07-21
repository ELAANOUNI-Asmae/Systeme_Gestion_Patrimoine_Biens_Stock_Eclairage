package ma.project.sgpbse.dto.response;

import lombok.*;
import ma.project.sgpbse.entity.Role;
import ma.project.sgpbse.enums.Gender;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfilDtoResponse {
    private Long id;
    private String email;
    private String fullname;
    private Gender gender;
    private String phone;
    private String cin;
    private Role role;
}
