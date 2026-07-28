package ma.project.sgpbse.repository.user;

import ma.project.sgpbse.entity.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {

    User findByCin(String cin);
    User findByEmail(String email);

}
