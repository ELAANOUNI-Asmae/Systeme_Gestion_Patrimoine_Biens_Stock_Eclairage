package ma.project.sgpbse.repository.user;

import ma.project.sgpbse.entity.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {

    User findByCin(String cin);
    User findByEmail(String email);

    @Query("SELECT u FROM User u WHERE " +
            "LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(u.cin) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(u.firstname_fr) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " + // J'ai ajouté firstname pour une meilleure recherche
            "LOWER(u.lastname_fr) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<User> searchGlobally(@Param("keyword") String keyword, Pageable pageable);

    List<User> findByRoleName(String roleName);

    @Query("SELECT u FROM User u JOIN u.role r JOIN r.permissions p WHERE LOWER(p.name) = LOWER(:permissionName)")
    List<User> findAllByPermissionName(@Param("permissionName") String permissionName);

}