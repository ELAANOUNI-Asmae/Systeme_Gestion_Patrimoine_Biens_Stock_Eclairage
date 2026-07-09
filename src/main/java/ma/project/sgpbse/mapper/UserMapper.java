package ma.project.sgpbse.mapper;

import ma.project.sgpbse.dto.request.UserCreationDtoRequest;
import ma.project.sgpbse.dto.request.UserDtoRequest;
import ma.project.sgpbse.dto.response.UserDtoResponse;
import ma.project.sgpbse.dto.response.UserProfilDtoResponse;
import ma.project.sgpbse.entity.User;
import ma.project.sgpbse.enums.Gender;
import ma.project.sgpbse.enums.Role;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface UserMapper {

    //à faire un hashage + sault plus tard
    @Mapping(source = "pwd", target = "hash_pwd")
    User toEntity(UserDtoRequest dto);

    @Mapping(source = ".", target = "fullName", qualifiedByName = "getFullName")
    UserProfilDtoResponse toDtoProfil(User user);

    @Mapping(source = ".", target = "fullName", qualifiedByName = "getFullName")
    UserDtoResponse toDto(User user);

    default User toEntity(UserCreationDtoRequest userCreationDtoRequest){
        return User.builder()
                .email(userCreationDtoRequest.getEmail())
                .firstname(userCreationDtoRequest.getFirstname())
                .lastname(userCreationDtoRequest.getLastname())
                .phone(userCreationDtoRequest.getPhone())
                .cin(userCreationDtoRequest.getCin())
                .hash_pwd(userCreationDtoRequest.getPwd())
                .sault("random")
                .role(Role.valueOf(userCreationDtoRequest.getRole()))
                .gender(Gender.valueOf(userCreationDtoRequest.getGender()))
                .build();
    }

    @Named("getFullName")
    default String getFullName(User user){
        return user.getFirstname() +" " + user.getLastname();
    }

}