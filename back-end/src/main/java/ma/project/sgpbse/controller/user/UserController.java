package ma.project.sgpbse.controller.user;

import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.project.sgpbse.dto.user.request.UserDtoRequest;
import ma.project.sgpbse.dto.user.response.UserDtoResponse;
import ma.project.sgpbse.dto.user.response.UserProfilDtoResponse;
import ma.project.sgpbse.entity.user.User;
import ma.project.sgpbse.enums.AccountStatus;
import ma.project.sgpbse.service.jwt.JwtService;
import ma.project.sgpbse.service.user.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
    @PreAuthorize("hasAuthority('CREATE_USER')")
    public ResponseEntity<UserDtoResponse> createUser(@RequestBody @Valid UserDtoRequest userDtoRequest){
        return ResponseEntity.ok(userService.createUser(userDtoRequest));
    }

    //method 2 : update user
    @PutMapping("/update/{user_id}")
    @PreAuthorize("hasAuthority('UPDATE_USER')")
    public ResponseEntity<?> updateUser(@PathVariable Long user_id, @RequestBody @Valid UserDtoRequest userDtoRequest){
        return ResponseEntity.ok(userService.updateUser(user_id, userDtoRequest));
    }

    //method 3: delete user
    @DeleteMapping("/delete/{user_id}")
    @PreAuthorize("hasAuthority('DELETE_USER')")
    public ResponseEntity<Long> deleteUser(@PathVariable Long user_id){
        return ResponseEntity.ok(userService.deleteUser(user_id));
    }

    //method 4 : show profile
    @GetMapping("/profil/{user_id}")
    @PreAuthorize("hasAuthority('GET_PROFIL')")
    public ResponseEntity<UserProfilDtoResponse> getProfil(@PathVariable Long user_id){
        return ResponseEntity.ok(userService.getProfil(user_id));
    }

    //method 5 : get all users
    @GetMapping("/all")
    @PreAuthorize("hasAuthority('GET_ALL_PROFILS')")
    public ResponseEntity<List<UserProfilDtoResponse>> getAllProfils(){
        return ResponseEntity.ok(userService.getProfils());
    }

    //search user by username, email or cin
    @GetMapping("/search")
    @PreAuthorize("hasAuthority('SEARCH_USER')")
    public ResponseEntity<Page<User>> searchUsers(
            @RequestParam("query") String query,
            Pageable pageable) {
        return ResponseEntity.ok(userService.searchUsers(query, pageable));
    }

    //filter users by role name
    @GetMapping("/filter_by_role")
    @PreAuthorize("hasAuthority('FILTER_USERS_BY_ROLE')")
    public ResponseEntity<List<UserProfilDtoResponse>> filterByRoleName(@RequestBody String role_name){
        return ResponseEntity.ok(userService.filterByRoleName(role_name));
    }

    //activate account
    @PostMapping("/activate/{user_id}")
    @PreAuthorize("hasAuthority('ACTIVATE_ACCOUNT')")
    public ResponseEntity<String> activateAccount(@PathVariable Long user_id){
        return ResponseEntity.ok(userService.activateAccount(user_id));
    }

    //deactivate account
    @PostMapping("/deactivate/{user_id}")
    @PreAuthorize("hasAuthority('DEACTIVATE_ACCOUNT')")
    public ResponseEntity<String> deactivateAccount(@PathVariable Long user_id){
        return ResponseEntity.ok(userService.deactivateAccount(user_id));
    }

}
