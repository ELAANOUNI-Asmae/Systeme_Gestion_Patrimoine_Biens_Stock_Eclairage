package ma.project.sgpbse.mapper;

import ma.project.sgpbse.dto.request.UserDtoRequest;
import ma.project.sgpbse.dto.response.UserDtoResponse;
import ma.project.sgpbse.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "fullname", source = "fullname")
    @Mapping(target = "email", source = "email")
    @Mapping(target = "role", source = "role")
    UserDtoResponse toDto(User user);

    @Mapping(target = "email", source = "email")
    @Mapping(target = "hash_pwd", source = "pwd")
    @Mapping(target = "sault", constant = "sault_default")
    User toEntity(UserDtoRequest dto);
}