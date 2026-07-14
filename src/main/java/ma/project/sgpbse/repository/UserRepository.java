package ma.project.sgpbse.repository;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import ma.project.sgpbse.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {

    User findByCin(String cin);
    User findByEmail(String email);

}
