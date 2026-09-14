package ma.project.sgpbse.repository.user;

import ma.project.sgpbse.entity.user.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface RoleRepository extends JpaRepository<Role, Long> {

    Role findByName(String name);

    @Query("SELECT r.name FROM Role r")
    List<String> findAllRoleNames();
}
