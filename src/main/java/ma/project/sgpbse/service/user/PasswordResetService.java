package ma.project.sgpbse.service.user;

import lombok.RequiredArgsConstructor;
import ma.project.sgpbse.dto.request.ResetPasswordRequest;
import ma.project.sgpbse.entity.PasswordResetToken;
import ma.project.sgpbse.entity.User;
import ma.project.sgpbse.repository.PasswordResetTokenRepository;
import ma.project.sgpbse.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private static final long TOKEN_VALIDITY_MINUTES = 15;

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {

        if (!request.getNewPassword()
                .equals(request.getConfirmPassword())) {

            throw new IllegalArgumentException(
                    "Les mots de passe ne correspondent pas."
            );
        }

        PasswordResetToken resetToken =
                tokenRepository.findByToken(request.getToken())
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Token invalide"
                                )
                        );

        if (resetToken.isUsed()) {
            throw new IllegalArgumentException(
                    "Ce token a déjà été utilisé"
            );
        }

        if (resetToken.getExpirationDate()
                .isBefore(LocalDateTime.now())) {

            throw new IllegalArgumentException(
                    "Ce token a expiré"
            );
        }

        User user = resetToken.getUser();

        user.setHash_pwd(
                passwordEncoder.encode(
                        request.getNewPassword()
                )
        );

        userRepository.save(user);

        resetToken.setUsed(true);
        tokenRepository.save(resetToken);
    }

    @Transactional
    public void requestPasswordReset(String email) {

        User user = userRepository.findByEmail(email);

        // ما نكشفوش واش الإيميل موجود أو لا
        if (user == null) {
            return;
        }

        // حذف أي token قديمة ديال نفس المستخدم
        tokenRepository.deleteAllByUser(user);

        String tokenValue = UUID.randomUUID().toString();

        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(tokenValue)
                .expirationDate(
                        LocalDateTime.now()
                                .plusMinutes(TOKEN_VALIDITY_MINUTES)
                )
                .used(false)
                .user(user)
                .build();

        tokenRepository.save(resetToken);

        String resetLink =
                "http://localhost:4200/reset-password?token="
                        + tokenValue;

        emailService.sendPasswordResetEmail(
                user.getEmail(),
                resetLink
        );
    }
}