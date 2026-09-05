package ma.project.sgpbse.mapper.user;

import ma.project.sgpbse.dto.user.response.RoleResponseDto;
import ma.project.sgpbse.entity.user.Role;
import ma.project.sgpbse.entity.user.User;
import org.mapstruct.Mapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

@Mapper(componentModel = "spring")
public interface RoleMapper {

    List<RoleResponseDto> toDtos(List<Role> roles);

}
