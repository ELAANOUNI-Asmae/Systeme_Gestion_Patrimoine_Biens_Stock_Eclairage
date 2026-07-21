package ma.project.sgpbse.repository;

import ma.project.sgpbse.entity.Permission;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PermissionRepository extends JpaRepository<Permission, Long> {

    public Permission findByName(String name);
}
