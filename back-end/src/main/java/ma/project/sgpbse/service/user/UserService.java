package ma.project.sgpbse.service.user;

import ma.project.sgpbse.dto.user.request.UserDtoRequest;
import ma.project.sgpbse.exception.user.UserAlreadyExistException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;
import ma.project.sgpbse.dto.user.response.UserDtoResponse;
import ma.project.sgpbse.dto.user.response.UserProfilDtoResponse;
import ma.project.sgpbse.entity.user.User;
import ma.project.sgpbse.exception.user.UserNotExistException;
import ma.project.sgpbse.mapper.user.UserMapper;
import ma.project.sgpbse.repository.user.UserRepository;
import java.util.List;

@Service
public class UserService {

    //add dependencies
    @Autowired
    private PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final UserMapper userMapper;

    //inject dependencies via constructor
    public UserService(UserRepository userRepository, UserMapper userMapper){
        this.userRepository = userRepository;
        this.userMapper = userMapper;
    }

    //method 1: create user
    @Transactional
    public UserDtoResponse createUser(UserDtoRequest userDtoRequest){
        //1.Check if user already exist in our database
        String cin = userDtoRequest.getCin();
        User user = userRepository.findByCin(cin);

        //throw exception if user existed before
        if (user != null){
            throw new UserAlreadyExistException("Utilisateur existe déjà !");
        }

        String pwd_hash = passwordEncoder.encode(userDtoRequest.getPwd());

        //3.save user to the database
        userRepository.save(userMapper.toEntity(userDtoRequest, pwd_hash));

        //4.Return dto on response
        return userMapper.toDto(user);

    }

    //method 2 : update user
    @Transactional
    public UserDtoResponse updateUser(Long id, UserDtoRequest userDtoRequest){

        //1.Check if user exist
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotExistException("Utilisateur n'existe pas !"));

        //2.update user if exist
        userMapper.updateEntityFromDto(userDtoRequest, user);
        userRepository.save(user);

        //3.return response
        return userMapper.toDto(user);
    }

    //method 3: delete user
    @Transactional
    public Long deleteUser(Long id){

        //1.Check if user exist
        User user = userRepository.findById(id).orElseThrow(
                () -> new UserNotExistException("Utilisateur n'existe pas !")
        );

        //2.update user if exist
        userRepository.deleteById(id);

        //3.return response
        return id;
    }

    //method 5 : show profile
    @Transactional
    public UserProfilDtoResponse getProfil(Long id){

        //1.Check if user exist
        User user = userRepository.findById(id).orElseThrow(
                () -> new UserNotExistException("Utilisateur n'existe pas !")
        );

        //2.return profil
        return userMapper.toDtoProfil(user);
    }

    //method 6 : Get profils
    @Transactional
    public List<UserProfilDtoResponse> getProfils(){

        return userMapper.toDtos(userRepository.findAll());
    }

}
