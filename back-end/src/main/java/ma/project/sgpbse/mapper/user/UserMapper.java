package ma.project.sgpbse.mapper.user;
import ma.project.sgpbse.dto.user.request.UserDtoRequest;
import ma.project.sgpbse.dto.user.response.UserDtoResponse;
import ma.project.sgpbse.dto.user.response.UserProfilDtoResponse;
import ma.project.sgpbse.entity.user.User;
import ma.project.sgpbse.enums.AccountStatus;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(source = ".", target ="fullname_ar", qualifiedByName = "getFullNameAr")
    @Mapping(source = ".", target ="fullname_fr", qualifiedByName = "getFullNameFr")
    UserProfilDtoResponse toDtoProfil(User user);

    @Mapping(source = ".", target ="fullname_ar", qualifiedByName = "getFullNameAr")
    @Mapping(source = ".", target ="fullname_fr", qualifiedByName = "getFullNameFr")
    UserDtoResponse toDto(User user);

    @Named("getFullNameAr")
    default String getFullNameAr(User user){
        return user.getFirstname_ar() +" " + user.getLastname_ar();
    }

    @Named("getFullNameFr")
    default String getFullNameFr(User user){
        return user.getFirstname_fr() +" " + user.getLastname_fr();
    }

    default User toEntity(UserDtoRequest userDtoRequest, String pwd_hash){
        return User.builder()
                .email(userDtoRequest.getEmail())
                .firstname_ar(userDtoRequest.getFirstname_ar())
                .firstname_fr(userDtoRequest.getFirstname_fr())
                .lastname_ar(userDtoRequest.getLastname_ar())
                .lastname_fr(userDtoRequest.getLastname_fr())
                .phone(userDtoRequest.getPhone())
                .cin(userDtoRequest.getCin())
                .hash_pwd(pwd_hash)
                .role(userDtoRequest.getRole())
                .gender(userDtoRequest.getGender())
                .accountStatus(AccountStatus.INACTIVE)
                .build();
    }



    List<UserProfilDtoResponse> toDtos(List<User> users);

    void updateEntityFromDto(UserDtoRequest userDtoRequest, @MappingTarget User user);

}