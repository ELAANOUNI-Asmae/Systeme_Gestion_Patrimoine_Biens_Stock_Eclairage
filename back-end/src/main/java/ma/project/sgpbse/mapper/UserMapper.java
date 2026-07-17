package ma.project.sgpbse.mapper;
import ma.project.sgpbse.dto.request.UserCreationDtoRequest;
import ma.project.sgpbse.dto.request.UserDtoRequest;
import ma.project.sgpbse.dto.response.UserDtoResponse;
import ma.project.sgpbse.dto.response.UserProfilDtoResponse;
import ma.project.sgpbse.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UserMapper {

    //à faire un hashage + sault plus tard
    @Mapping(source = "pwd", target = "hash_pwd")
    User toEntity(UserDtoRequest dto);

    @Mapping(source = ".", target = "fullname", qualifiedByName = "getFullName")
    UserProfilDtoResponse toDtoProfil(User user);

    @Mapping(source = ".", target ="fullname", qualifiedByName = "getFullName")
    UserDtoResponse toDto(User user);

    default User toEntity(UserCreationDtoRequest userCreationDtoRequest, String pwd_hash){
        return User.builder()
                .email(userCreationDtoRequest.getEmail())
                .firstname(userCreationDtoRequest.getFirstname())
                .lastname(userCreationDtoRequest.getLastname())
                .phone(userCreationDtoRequest.getPhone())
                .cin(userCreationDtoRequest.getCin())
                .hash_pwd(pwd_hash)
                .role(userCreationDtoRequest.getRole())
                .gender(userCreationDtoRequest.getGender())
                .build();
    }

    @Named("getFullName")
    default String getFullName(User user){
        return user.getFirstname() +" " + user.getLastname();
    }

    List<UserProfilDtoResponse> toDtos(List<User> users);

    void updateEntityFromDto(UserCreationDtoRequest userCreationDtoRequest, @MappingTarget User user);

}