package ma.project.sgpbse.service.user;

import jakarta.transaction.Transactional;
import ma.project.sgpbse.dto.user.request.ChangePasswordRequest;
import ma.project.sgpbse.dto.user.request.SelfProfileUpdateRequest;
import ma.project.sgpbse.dto.user.request.UserDtoRequest;
import ma.project.sgpbse.dto.user.response.UserDtoResponse;
import ma.project.sgpbse.dto.user.response.UserProfilDtoResponse;
import ma.project.sgpbse.entity.publicLighting.Intervention;
import ma.project.sgpbse.entity.stock.OutStock;
import ma.project.sgpbse.entity.user.Role;
import ma.project.sgpbse.entity.user.User;
import ma.project.sgpbse.enums.AccountStatus;
import ma.project.sgpbse.exception.user.UserAlreadyExistException;
import ma.project.sgpbse.exception.user.UserNotExistException;
import ma.project.sgpbse.mapper.user.UserMapper;
import ma.project.sgpbse.repository.user.RoleRepository;
import ma.project.sgpbse.repository.user.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final RoleRepository roleRepository;
    private final CurrentUserService currentUserService;

    public UserService(
            PasswordEncoder passwordEncoder,
            UserRepository userRepository,
            UserMapper userMapper,
            RoleRepository roleRepository,
            CurrentUserService currentUserService
    ) {
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.roleRepository = roleRepository;
        this.currentUserService = currentUserService;
    }

    // CREATE USER
    @Transactional
    public UserDtoResponse createUser(
            UserDtoRequest userDtoRequest
    ) {

        if (
                userDtoRequest.getPwd() == null ||
                        userDtoRequest.getPwd().isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Le mot de passe est obligatoire !"
            );
        }

        String cin =
                userDtoRequest
                        .getCin()
                        .trim()
                        .toUpperCase();

        String email =
                userDtoRequest
                        .getEmail()
                        .trim()
                        .toLowerCase();

        if (userRepository.findByCin(cin) != null) {
            throw new UserAlreadyExistException(
                    "Un utilisateur avec ce CIN existe déjà !"
            );
        }

        if (userRepository.findByEmail(email) != null) {
            throw new UserAlreadyExistException(
                    "Un utilisateur avec cet e-mail existe déjà !"
            );
        }

        Role role =
                resolveRole(
                        userDtoRequest
                );

        userDtoRequest.setCin(cin);
        userDtoRequest.setEmail(email);
        userDtoRequest.setRole(role);

        String pwdHash =
                passwordEncoder.encode(
                        userDtoRequest.getPwd()
                );

        User newUser =
                userMapper.toEntity(
                        userDtoRequest,
                        pwdHash
                );

        User savedUser =
                userRepository.save(
                        newUser
                );

        return userMapper.toDto(
                savedUser
        );
    }

    // UPDATE USER
    @Transactional
    public UserDtoResponse updateUser(
            Long id,
            UserDtoRequest userDtoRequest
    ) {

        User user =
                userRepository
                        .findById(id)
                        .orElseThrow(
                                () ->
                                        new UserNotExistException(
                                                "Utilisateur n'existe pas !"
                                        )
                        );

        String cin =
                userDtoRequest
                        .getCin()
                        .trim()
                        .toUpperCase();

        String email =
                userDtoRequest
                        .getEmail()
                        .trim()
                        .toLowerCase();

        User userWithSameCin =
                userRepository.findByCin(
                        cin
                );

        if (
                userWithSameCin != null &&
                        !userWithSameCin
                                .getId()
                                .equals(id)
        ) {
            throw new UserAlreadyExistException(
                    "Un utilisateur avec ce CIN existe déjà !"
            );
        }

        User userWithSameEmail =
                userRepository.findByEmail(
                        email
                );

        if (
                userWithSameEmail != null &&
                        !userWithSameEmail
                                .getId()
                                .equals(id)
        ) {
            throw new UserAlreadyExistException(
                    "Un utilisateur avec cet e-mail existe déjà !"
            );
        }

        Role role =
                resolveRole(
                        userDtoRequest
                );

        userDtoRequest.setCin(cin);
        userDtoRequest.setEmail(email);
        userDtoRequest.setRole(role);

        userMapper.updateEntityFromDto(
                userDtoRequest,
                user
        );

        userRepository.save(
                user
        );

        return userMapper.toDto(
                user
        );
    }

    // DELETE USER
    @Transactional
    public Long deleteUser(
            Long id
    ) {

        userRepository
                .findById(id)
                .orElseThrow(
                        () ->
                                new UserNotExistException(
                                        "Utilisateur n'existe pas !"
                                )
                );

        userRepository.deleteById(
                id
        );

        return id;
    }

    // SHOW PROFILE
    @Transactional
    public UserProfilDtoResponse getProfil(
            Long id
    ) {

        User user =
                userRepository
                        .findById(id)
                        .orElseThrow(
                                () ->
                                        new UserNotExistException(
                                                "Utilisateur n'existe pas !"
                                        )
                        );

        return userMapper.toDtoProfil(
                user
        );
    }

    // UPDATE CURRENT CONNECTED USER PROFILE
    @Transactional
    public UserProfilDtoResponse updateCurrentProfile(SelfProfileUpdateRequest request) {
        User user = currentUserService.getCurrentUser();
        if (user == null) {
            throw new UserNotExistException("Utilisateur connecté introuvable !");
        }

        user.setFirstname_fr(cleanRequired(request.getFirstname_fr(), "Le prénom est obligatoire !"));
        user.setLastname_fr(cleanRequired(request.getLastname_fr(), "Le nom est obligatoire !"));
        user.setFirstname_ar(cleanOptional(request.getFirstname_ar()));
        user.setLastname_ar(cleanOptional(request.getLastname_ar()));
        user.setPhone(cleanOptional(request.getPhone()));

        User saved = userRepository.save(user);
        return userMapper.toDtoProfil(saved);
    }

    // CHANGE CURRENT CONNECTED USER PASSWORD
    @Transactional
    public void changeCurrentPassword(ChangePasswordRequest request) {
        User user = currentUserService.getCurrentUser();
        if (user == null) {
            throw new UserNotExistException("Utilisateur connecté introuvable !");
        }
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getHash_pwd())) {
            throw new IllegalArgumentException("CURRENT_PASSWORD_INVALID");
        }
        if (passwordEncoder.matches(request.getNewPassword(), user.getHash_pwd())) {
            throw new IllegalArgumentException("NEW_PASSWORD_MUST_BE_DIFFERENT");
        }

        user.setHash_pwd(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    // GET ALL USERS
    @Transactional
    public List<UserProfilDtoResponse>
    getProfils() {

        return userMapper.toDtos(
                userRepository.findAll()
        );
    }

    // GET USER BY ID
    @Transactional
    public User getUserById(
            Long userId
    ) {

        return userRepository
                .findById(userId)
                .orElseThrow(
                        () ->
                                new UserNotExistException(
                                        "Utilisateur n'existe pas !"
                                )
                );
    }

    @Transactional
    public void addOutStock(
            User user,
            OutStock outStock
    ) {

        user.getOutStockList()
                .add(outStock);

        userRepository.save(
                user
        );
    }

    @Transactional
    public void addIntervention(
            User user,
            Intervention intervention
    ) {

        user.getInterventionList()
                .add(intervention);

        userRepository.save(
                user
        );
    }

    @Transactional
    public Long countAllUsers() {
        return userRepository.count();
    }

    @Transactional
    public Page<User> searchUsers(
            String query,
            Pageable pageable
    ) {

        return userRepository.searchGlobally(
                query,
                pageable
        );
    }

    @Transactional
    public List<UserProfilDtoResponse>
    filterByRoleName(
            String roleName
    ) {

        return userMapper.toDtos(
                userRepository.findByRoleName(
                        roleName
                )
        );
    }

    @Transactional
    public String activateAccount(
            Long userId
    ) {

        User user =
                getUserById(
                        userId
                );

        user.setAccountStatus(
                AccountStatus.ACTIVE
        );

        userRepository.save(
                user
        );

        return user.getEmail();
    }

    @Transactional
    public String deactivateAccount(
            Long userId
    ) {

        User user =
                getUserById(
                        userId
                );

        user.setAccountStatus(
                AccountStatus.INACTIVE
        );

        userRepository.save(
                user
        );

        return user.getEmail();
    }

    @Transactional
    public List<User>
    filterByPermissionName(
            String permissionName
    ) {

        return userRepository
                .findAllByPermissionName(
                        permissionName
                );
    }

    private String cleanRequired(String value, String message) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException(message);
        }
        return value.trim();
    }

    private String cleanOptional(String value) {
        return value == null ? "" : value.trim();
    }

    private Role resolveRole(
            UserDtoRequest request
    ) {

        if (
                request.getRole() == null ||
                        request.getRole().getId() == null
        ) {
            throw new IllegalArgumentException(
                    "Le rôle est obligatoire !"
            );
        }

        return roleRepository
                .findById(
                        request
                                .getRole()
                                .getId()
                )
                .orElseThrow(
                        () ->
                                new IllegalArgumentException(
                                        "Rôle introuvable !"
                                )
                );
    }
}