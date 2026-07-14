package ma.project.sgpbse.controller;

import jakarta.validation.Valid;
import ma.project.sgpbse.dto.request.UserCreationDtoRequest;
import ma.project.sgpbse.dto.request.UserDtoRequest;
import ma.project.sgpbse.dto.response.UserDtoResponse;
import ma.project.sgpbse.dto.response.UserProfilDtoResponse;
import ma.project.sgpbse.entity.User;
import ma.project.sgpbse.service.jwt.JwtService;
import ma.project.sgpbse.service.user.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sgpbse/user")
public class UserController {

    private final UserService userService;

    @Autowired
    private JwtService jwtService;

    public UserController(UserService userService){
        this.userService = userService;
    }

    //method 1: create user
    @PostMapping("/create")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<UserDtoResponse> createUser(@RequestBody @Valid UserCreationDtoRequest userCreationDtoRequest){
        return ResponseEntity.ok(userService.createUser(userCreationDtoRequest));
    }

    //method 2 : update user
    @PutMapping("/update/{user_id}")
    public ResponseEntity<String> updateUser(@PathVariable Long user_id, @RequestBody @Valid UserCreationDtoRequest userCreationDtoRequest){
        return ResponseEntity.ok(userService.updateUser(user_id, userCreationDtoRequest));
    }

    //method 3: delete user
    @DeleteMapping("/delete/{user_id}")
    public ResponseEntity<Long> deleteUser(@PathVariable Long user_id){
        return ResponseEntity.ok(userService.deleteUser(user_id));
    }

    //method 4 : login

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody @Valid UserDtoRequest userDtoRequest) {
        return ResponseEntity.ok(userService.login(userDtoRequest));
    }

    //method 3 : log out
    @PostMapping("/logout")
    public ResponseEntity<UserDtoResponse> logout(@RequestBody String email){
        return ResponseEntity.ok(userService.logout(email));
    }

    //method 4 : show profile
    @GetMapping("/profile/{user_id}")
    public ResponseEntity<UserProfilDtoResponse> getProfil(@PathVariable Long user_id){
        return ResponseEntity.ok(userService.getProfil(user_id));
    }

    //method 5 : get all users
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @GetMapping("/all")
    public ResponseEntity<List<UserProfilDtoResponse>> getAllProfils(){
        return ResponseEntity.ok(userService.getProfils());
    }



}
