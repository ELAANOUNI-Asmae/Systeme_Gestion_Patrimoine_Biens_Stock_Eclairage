package ma.project.sgpbse.mapper;

import ma.project.sgpbse.dto.request.RoleRequestDto;
import ma.project.sgpbse.dto.response.RoleResponseDto;
import ma.project.sgpbse.entity.Role;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import java.util.List;

@Mapper(componentModel = "spring")
public interface RoleMapper {

    void updateEntityFromDto(RoleRequestDto roleRequestDto, @MappingTarget Role role);

    List<RoleResponseDto> toDtos(List<Role> roles);
}
