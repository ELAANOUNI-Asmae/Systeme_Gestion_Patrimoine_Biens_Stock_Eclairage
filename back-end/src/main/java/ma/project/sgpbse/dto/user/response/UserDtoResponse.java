package ma.project.sgpbse.dto.user.response;

import lombok.*;
import ma.project.sgpbse.entity.user.Role;

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
