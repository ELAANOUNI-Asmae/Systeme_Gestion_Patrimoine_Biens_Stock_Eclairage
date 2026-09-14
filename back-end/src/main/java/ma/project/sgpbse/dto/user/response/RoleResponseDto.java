package ma.project.sgpbse.dto.user.response;

import lombok.*;
import ma.project.sgpbse.entity.user.Permission;

import java.util.Set;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RoleResponseDto {

    private Long id;

    private String name;

    private Set<Permission> permissions;
}