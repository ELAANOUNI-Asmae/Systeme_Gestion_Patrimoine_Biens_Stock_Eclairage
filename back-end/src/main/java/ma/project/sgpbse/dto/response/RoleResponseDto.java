package ma.project.sgpbse.dto.response;

import lombok.*;
import ma.project.sgpbse.entity.Permission;
import java.util.Set;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder

public class RoleResponseDto {
    private String name;
    private Set<Permission> permissions;
}
