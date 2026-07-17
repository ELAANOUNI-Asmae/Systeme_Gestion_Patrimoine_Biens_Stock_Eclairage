package ma.project.sgpbse.repository;

import ma.project.sgpbse.entity.PasswordResetToken;
import ma.project.sgpbse.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PasswordResetTokenRepository
        extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByToken(String token);

    void deleteAllByUser(User user);

}