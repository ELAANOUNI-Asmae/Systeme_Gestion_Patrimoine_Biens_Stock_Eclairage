package mapper;

import dto.request.UserDtoRequest;
import dto.response.UserDtoResponse;
import entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserDtoResponse toDto(User user);

    @Mapping(target = "hash_pwd", source = "pwd")
    @Mapping(target = "sault", constant = "sault_default")
    User toEntity(UserDtoRequest dto);
}