package ma.project.sgpbse.service.user;

import ma.project.sgpbse.service.jwt.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;
import ma.project.sgpbse.dto.request.UserCreationDtoRequest;
import ma.project.sgpbse.dto.request.UserDtoRequest;
import ma.project.sgpbse.dto.response.UserDtoResponse;
import ma.project.sgpbse.dto.response.UserProfilDtoResponse;
import ma.project.sgpbse.entity.User;
import ma.project.sgpbse.exception.UserNotExistException;
import ma.project.sgpbse.mapper.UserMapper;
import ma.project.sgpbse.repository.UserRepository;
import ma.project.sgpbse.service.jwt.AuthResponse;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    //add dependencies
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtService jwtService;
    private final UserRepository userRepository;
    private final UserMapper userMapper;

    //inject dependencies via constructor
    public UserService(UserRepository userRepository, UserMapper userMapper){
        this.userRepository = userRepository;
        this.userMapper = userMapper;
    }

    //method 1: create user
    @Transactional
    public UserDtoResponse createUser(UserCreationDtoRequest userCreationDtoRequest){
        //1.Check if user already exist in our database
        String cin = userCreationDtoRequest.getCin();
        User user = userRepository.findByCin(cin);

        //throw exception if user existed before
        if (user!=null){
            throw new RuntimeException("Utilisateur existe déjà !");
        }

        String pwd_hash = passwordEncoder.encode(userCreationDtoRequest.getPwd());

        //3.save user to the database
        userRepository.save(userMapper.toEntity(userCreationDtoRequest, pwd_hash));

        //4.Return dto on response
        return userMapper.toDto(user);

    }

    //method 2 : update user
    @Transactional
    public String updateUser(Long id, UserCreationDtoRequest userCreationDtoRequest){

        //1.Check if user exist
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotExistException("Utilisateur n'existe pas !"));

        //2.update user if exist
        userMapper.updateEntityFromDto(userCreationDtoRequest, user);
        userRepository.save(user);

        //3.return response
        return "L'utilisateur est bien mis à jour!";
    }

    //method 3: delete user
    @Transactional
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

    //method 3: login
    @Transactional
    public AuthResponse login(UserDtoRequest userDtoRequest){

        //1.Check if user exist
        User user = userRepository.findByEmail(userDtoRequest.getEmail());
        if (user == null){
            throw new UserNotExistException("Nom utilisateur ou mot de passe incorrecte!");
        }

        //2.Check if already connected

        //3.verify user password by calculating hash with sault
        boolean valid = passwordEncoder.matches(userDtoRequest.getPwd(), user.getHash_pwd());

        if (!valid){
            throw new UserNotExistException("Nom utilisateur ou mot de passe incorrecte!");
        }

        //4.update connection status

        // 3. On génère le token JWT
        String token = jwtService.genererToken(user.getEmail(), user.getRole().name());

        // 4. On renvoie le token à l'utilisateur sous forme de JSON
        return new AuthResponse(token);
    }

    //method 4 : log out
    @Transactional
    public UserDtoResponse logout(String email){

        //1.Check if user exist
        User user = userRepository.findByEmail(email);

        if (user == null){
            throw new UserNotExistException("Utilisateur n'existe pas !");
        }

        //2.Check if user connected

        //3.update connection status

        //3.return response
        return userMapper.toDto(user);
    }

    //method 5 : show profile
    @Transactional
    public UserProfilDtoResponse getProfil(Long id){

        //1.Check if user exist
        Optional<User> user = userRepository.findById(id);

        if (user.equals(Optional.empty())){
            throw new UserNotExistException("Utilisateur n'existe pas !");
        }

        //2.Check if user connected

        //3.return response
        return userMapper.toDtoProfil((User)user.get());
    }

    //method 6 : Get profils
    @Transactional
    public List<UserProfilDtoResponse> getProfils(){

        return userMapper.toDtos(userRepository.findAll());
    }

}
