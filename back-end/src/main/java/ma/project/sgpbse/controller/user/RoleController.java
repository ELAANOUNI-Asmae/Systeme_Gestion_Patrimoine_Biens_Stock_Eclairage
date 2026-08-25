package ma.project.sgpbse.controller.user;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import ma.project.sgpbse.dto.user.request.RoleRequestDto;
import ma.project.sgpbse.service.user.RoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@AllArgsConstructor

@RestController
@RequestMapping("/sgpbse/role")
public class RoleController {

    @Autowired
    private final RoleService roleService;

    @PostMapping("/create")
    @PreAuthorize("hasAuthority('CREATE_ROLE')")
    public ResponseEntity<?> createRole(@RequestBody @Valid RoleRequestDto roleRequestDto){
        return ResponseEntity.ok(roleService.createRole(roleRequestDto));
    }

    @DeleteMapping("/delete/{role_id}")
    @PreAuthorize("hasAuthority('DELETE_ROLE')")
    public ResponseEntity<?> deleteRole(@PathVariable Long role_id){
        return ResponseEntity.ok(roleService.deleteRole(role_id));
    }

    @PutMapping("/update/{role_id}")
    @PreAuthorize("hasAuthority('UPDATE_ROLE')")
    public ResponseEntity<?> updateRole(@RequestBody @Valid RoleRequestDto roleRequestDto, @PathVariable Long role_id){
        return ResponseEntity.ok(roleService.updateRole(role_id, roleRequestDto));
    }

    @GetMapping("/permissions/{role_id}")
    @PreAuthorize("hasAuthority('GET_ROLE_PERMISSIONS')")
    public ResponseEntity<?> getRolePermission(@PathVariable Long role_id){
        return ResponseEntity.ok(roleService.getRolePermissions(role_id));
    }

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('GET_ALL_ROLES')")
    public ResponseEntity<?> getAllRoles(){
        return ResponseEntity.ok(roleService.getAllRoles());
    }


}
