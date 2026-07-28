package ma.project.sgpbse.repository.user;

import ma.project.sgpbse.entity.user.Permission;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PermissionRepository extends JpaRepository<Permission, Long> {

    public Permission findByName(String name);
}
