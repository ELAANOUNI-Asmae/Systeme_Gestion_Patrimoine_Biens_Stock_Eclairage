package ma.project.sgpbse.service;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import ma.project.sgpbse.dto.request.RoleRequestDto;
import ma.project.sgpbse.dto.response.RoleResponseDto;
import ma.project.sgpbse.entity.Permission;
import ma.project.sgpbse.entity.Role;
import ma.project.sgpbse.entity.User;
import ma.project.sgpbse.exception.PermissionNotExistException;
import ma.project.sgpbse.exception.RoleAlreadyExistException;
import ma.project.sgpbse.exception.RoleNotExistException;
import ma.project.sgpbse.exception.UserNotExistException;
import ma.project.sgpbse.mapper.RoleMapper;
import ma.project.sgpbse.repository.PermissionRepository;
import ma.project.sgpbse.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@AllArgsConstructor
public class RoleService {

    @Autowired
    private final RoleRepository roleRepository;
    @Autowired
    private final PermissionRepository permissionRepository;

    @Autowired
    private final RoleMapper roleMapper;

    //Method 1: Create Role
    @Transactional
    public String createRole(RoleRequestDto roleRequestDto){

        //1.Check if role already exist
        Role role = roleRepository.findByName(roleRequestDto.getName());
        if (role != null){
            throw new RoleAlreadyExistException("Ce rôle existe déjà !");
        }

        //2.Prepare permissions set
        Set<Permission> permissions = new HashSet<>();
        for (Long perm_id : roleRequestDto.getPermission_ids()){

            //Check if permission exist
            Permission p = permissionRepository.findById(perm_id)
                    .orElseThrow(
                            () -> new PermissionNotExistException("Il n'existe aucune permission avec l'id " + perm_id)
                    );

            //Add permission to role set
            permissions.add(p);
        }

        //2.Create Role
        role = Role.builder()
                .name(roleRequestDto.getName())
                .permissions(permissions)
                .build();

        //3.Save role to database
        roleRepository.save(role);

        return "Successfully created";
    }

    //Method 2: Delete Role
    @Transactional
    public String deleteRole(@PathVariable Long role_id){

        //1.Check if role exist
        Role role = roleRepository.findById(role_id)
                .orElseThrow(
                        () -> new RoleNotExistException("Role n'existe pas !")
                );

        //2.Delete role
        roleRepository.delete(role);

        return "Successfully deleted";
    }

    //Method 3: update role
    @Transactional
    public Long updateRole(Long id, RoleRequestDto roleRequestDto){

        //1.Check if role exist
        Role role = roleRepository.findById(id).orElseThrow(
                () -> new RoleNotExistException("Role n'existe pas !")
        );

        //2.update role name
        role.setName(roleRequestDto.getName());

        //3.get permissions
        List<Permission> newPermissions = permissionRepository.findAllById(roleRequestDto.getPermission_ids());

        //4.Test if permissions are not empty
        if (newPermissions.isEmpty()){
            throw new IllegalArgumentException("Aucune permission valide trouvée pour les IDs fournis.");
        }

        //5.Update role permissions
        role.setPermissions(new HashSet<>(newPermissions));

        //3.return response
        return roleRepository.save(role).getId();
    }

    //Method 4: get role permissions
    @Transactional
    public List<String> getRolePermissions(Long role_id){
        //1.Check if role exist
        Role role = roleRepository.findById(role_id)
                .orElseThrow(
                        () -> new RoleNotExistException("Role n'existe pas !")
                );

        //2.Construct a list of permissions
        List<String> p = new ArrayList<>();
        for (Permission permission : role.getPermissions()){
            p.add(permission.getPermission());
        }

        return p;
    }

    //Method 5: get all roles
    @Transactional
    public List<RoleResponseDto> getAllRoles(){
        return roleMapper.toDtos(roleRepository.findAll());
    }

}
