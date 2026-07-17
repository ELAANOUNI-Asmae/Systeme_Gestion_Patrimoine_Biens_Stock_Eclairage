package ma.project.sgpbse.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.project.sgpbse.dto.request.UserDtoRequest;
import ma.project.sgpbse.dto.response.UserDtoResponse;
import ma.project.sgpbse.dto.response.UserProfilDtoResponse;
import ma.project.sgpbse.service.jwt.JwtService;
import ma.project.sgpbse.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sgpbse/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private JwtService jwtService;

    //method 1: create user
    @PostMapping("/create")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<UserDtoResponse> createUser(@RequestBody @Valid UserDtoRequest userDtoRequest){
        return ResponseEntity.ok(userService.createUser(userDtoRequest));
    }

    //method 2 : update user
    @PutMapping("/update/{user_id}")
    public ResponseEntity<String> updateUser(@PathVariable Long user_id, @RequestBody @Valid UserDtoRequest userDtoRequest){
        return ResponseEntity.ok(userService.updateUser(user_id, userDtoRequest));
    }

    //method 3: delete user
    @DeleteMapping("/delete/{user_id}")
    public ResponseEntity<Long> deleteUser(@PathVariable Long user_id){
        return ResponseEntity.ok(userService.deleteUser(user_id));
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
