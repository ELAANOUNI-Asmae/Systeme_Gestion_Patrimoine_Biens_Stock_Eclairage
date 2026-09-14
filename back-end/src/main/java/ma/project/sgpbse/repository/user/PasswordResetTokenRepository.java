package ma.project.sgpbse.repository.user;

import ma.project.sgpbse.entity.user.PasswordResetToken;
import ma.project.sgpbse.entity.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PasswordResetTokenRepository
        extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByToken(String token);

    void deleteAllByUser(User user);

}