package ma.project.sgpbse.service.user;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import ma.project.sgpbse.entity.user.Permission;
import ma.project.sgpbse.exception.user.PermissionNotExistException;
import ma.project.sgpbse.repository.user.PermissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@AllArgsConstructor
@Service
public class PermissionService {

    @Autowired
    private final PermissionRepository permissionRepository;


    // get permission by id
    @Transactional
    public Permission getPermissionById(Long id){
        return permissionRepository.findById(id)
                .orElseThrow(
                        () -> new PermissionNotExistException(
                                "Il n'existe aucune permission avec l'id " + id
                        )
                );
    }

    // get permissions by ids
    @Transactional
    public List<Permission> getAllPermissionsByIds(List<Long> ids){
        return permissionRepository.findAllById(ids);
    }

    @Transactional
    public Permission getPermissionByName(String name){
        return permissionRepository.findByName(name);
    }

    // get all permissions
    @Transactional
    public List<Permission> getAllPermissions(){
        return permissionRepository.findAll();
    }

}