package ma.project.sgpbse.service.user;

import ma.project.sgpbse.dto.request.UserCreationDtoRequest;
import ma.project.sgpbse.dto.request.UserDtoRequest;
import ma.project.sgpbse.dto.response.UserDtoResponse;
import ma.project.sgpbse.dto.response.UserProfilDtoResponse;
import ma.project.sgpbse.entity.User;
import ma.project.sgpbse.exception.UserAlreadyConnectedException;
import ma.project.sgpbse.exception.UserNotConnectedException;
import ma.project.sgpbse.exception.UserNotExistException;
import ma.project.sgpbse.mapper.UserMapper;
import ma.project.sgpbse.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    //add dependencies
    private final UserRepository userRepository;
    private final UserMapper userMapper;

    //inject dependencies via constructor
    public UserService(UserRepository userRepository, UserMapper userMapper){
        this.userRepository = userRepository;
        this.userMapper = userMapper;
    }

    //method 1: create user
    public UserDtoResponse createUser(UserCreationDtoRequest userCreationDtoRequest){
        //1.Check if user already exist in our database
        String cin = userCreationDtoRequest.getCin();
        boolean exist = userRepository.findByCin(cin);

        //throw exception if user existed before
        if (exist){
            throw new UserNotExistException("Utilisateur n'existe pas !");
        }

        //2.Get user from dto using mapper
        User user = userMapper.toEntity(userCreationDtoRequest);

        //3.save user to the database
        userRepository.save(user);

        //4.Return dto on response
        return userMapper.toDto(user);

    }

    //method 2 : update user
    public String updateUser(Long id, UserCreationDtoRequest userCreationDtoRequest){

        //1.Check if user exist
        User user = userRepository.findById(id) == null ?
                null : userMapper.toEntity(userCreationDtoRequest);
        if (user == null){
            throw new UserNotExistException("Utilisateur n'existe pas !");
        }

        //2.update user if exist
        user = userMapper.toEntity(userCreationDtoRequest);
        userRepository.save(user);

        //3.return response
        return "L'utilisateur est bien mis à jour!";
    }

    //method 3: delete user
    public Long deleteUser(Long id){

        //1.Check if user exist
        Optional<User> user = userRepository.findById(id);

        if (user.equals(Optional.empty())){
            throw new UserNotExistException("Utilisateur n'existe pas !");
        }

        //2.update user if exist
        userRepository.deleteById(id);

        //3.return response
        return id;
    }

    //method 4 : login
    public UserDtoResponse login(UserDtoRequest userDtoRequest){

        //1.Check if user exist
        User user = userRepository.findByEmail(userDtoRequest.getEmail()) == null ?
                null : userMapper.toEntity(userDtoRequest);

        if (user == null){
            throw new UserNotExistException("Nom utilisateur ou mot de passe incorrecte!");
        }

        //2.Check if already connected
        if (user.getConnected()){
            throw new UserAlreadyConnectedException("Vous êtes déjà connecté !");
        }

        //3.verify user password by calculating hash with sault
        boolean valid = VerifyUserPwd.verify(userDtoRequest.getPwd(),
                user.getHash_pwd(),
                user.getSault());
        if (!valid){
            throw new UserNotExistException("Nom utilisateur ou mot de passe incorrecte!");
        }

        //4.update connection status
        user.setConnected(true);
        userRepository.save(user);

        //5.return response
        return userMapper.toDto(user);
    }

    //method 3 : log out
    public UserDtoResponse logout(String email){

        //1.Check if user exist
        User user = userRepository.findByEmail(email);

        if (user.equals(null)){
            throw new UserNotExistException("Utilisateur n'existe pas !");
        }

        //2.Check if user connected
        if (!user.getConnected()){
            throw new UserNotConnectedException("Vous êtes non connecté !");
        }

        //3.update connection status
        user.setConnected(false);
        userRepository.save(user);

        //3.return response
        return userMapper.toDto(user);
    }

    //method 4 : show profile
    public UserProfilDtoResponse getProfil(Long id){

        //1.Check if user exist
        Optional<User> user = userRepository.findById(id);

        if (user.equals(Optional.empty())){
            throw new UserNotExistException("Utilisateur n'existe pas !");
        }

        //2.Check if user connected
        if (!(user).get().getConnected()){
            throw new UserNotConnectedException("Vous êtes non connecté !");
        }

        //3.return response
        return userMapper.toDtoProfil((User)user.get());
    }

}
