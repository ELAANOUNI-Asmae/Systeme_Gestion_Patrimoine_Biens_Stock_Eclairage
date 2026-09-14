package ma.project.sgpbse.controller.user;

import lombok.RequiredArgsConstructor;
import ma.project.sgpbse.entity.user.Permission;
import ma.project.sgpbse.service.user.PermissionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/sgpbse/permission")
@RequiredArgsConstructor
public class PermissionController {

    private final PermissionService permissionService;

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('GET_ROLE_PERMISSIONS')")
    public ResponseEntity<List<Permission>> getAllPermissions() {
        return ResponseEntity.ok(
                permissionService.getAllPermissions()
        );
    }
}