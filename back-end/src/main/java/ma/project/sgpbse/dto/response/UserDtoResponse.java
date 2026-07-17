package ma.project.sgpbse.dto.response;

import lombok.*;
import ma.project.sgpbse.enums.Role;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class UserDtoResponse {

    private String fullname;
    private String email;
    private Role role;
}
