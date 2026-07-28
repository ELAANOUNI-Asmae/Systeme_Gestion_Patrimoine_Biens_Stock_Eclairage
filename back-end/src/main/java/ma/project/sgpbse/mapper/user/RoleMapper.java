package ma.project.sgpbse.mapper.user;

import ma.project.sgpbse.dto.user.response.RoleResponseDto;
import ma.project.sgpbse.entity.user.Role;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface RoleMapper {

    List<RoleResponseDto> toDtos(List<Role> roles);
}
