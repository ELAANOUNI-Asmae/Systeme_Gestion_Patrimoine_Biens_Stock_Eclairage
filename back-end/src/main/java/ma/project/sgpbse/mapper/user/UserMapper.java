package ma.project.sgpbse.mapper.user;
import ma.project.sgpbse.dto.user.request.UserDtoRequest;
import ma.project.sgpbse.dto.user.response.UserDtoResponse;
import ma.project.sgpbse.dto.user.response.UserProfilDtoResponse;
import ma.project.sgpbse.entity.user.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(source = ".", target = "fullname", qualifiedByName = "getFullName")
    UserProfilDtoResponse toDtoProfil(User user);

    @Mapping(source = ".", target ="fullname", qualifiedByName = "getFullName")
    UserDtoResponse toDto(User user);

    default User toEntity(UserDtoRequest userDtoRequest, String pwd_hash){
        return User.builder()
                .email(userDtoRequest.getEmail())
                .firstname(userDtoRequest.getFirstname())
                .lastname(userDtoRequest.getLastname())
                .phone(userDtoRequest.getPhone())
                .cin(userDtoRequest.getCin())
                .hash_pwd(pwd_hash)
                .role(userDtoRequest.getRole())
                .gender(userDtoRequest.getGender())
                .build();
    }

    @Named("getFullName")
    default String getFullName(User user){
        return user.getFirstname() +" " + user.getLastname();
    }

    List<UserProfilDtoResponse> toDtos(List<User> users);

    void updateEntityFromDto(UserDtoRequest userDtoRequest, @MappingTarget User user);

}