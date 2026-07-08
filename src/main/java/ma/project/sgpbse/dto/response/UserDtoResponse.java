package ma.project.sgpbse.dto.response;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class UserDtoResponse {

    private String fullname;
    private String email;
    private String role;
}
