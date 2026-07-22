package ma.project.sgpbse.service;

import lombok.RequiredArgsConstructor;
import ma.project.sgpbse.dto.request.ResetPasswordRequest;
import ma.project.sgpbse.dto.request.AuthDtoRequest;
import ma.project.sgpbse.entity.PasswordResetToken;
import ma.project.sgpbse.entity.Permission;
import ma.project.sgpbse.entity.Role;
import ma.project.sgpbse.entity.User;
import ma.project.sgpbse.exception.UserNotExistException;
import ma.project.sgpbse.exception.UserPwdNotValidException;
import ma.project.sgpbse.repository.PasswordResetTokenRepository;
import ma.project.sgpbse.repository.UserRepository;
import ma.project.sgpbse.service.jwt.AuthResponse;
import ma.project.sgpbse.service.jwt.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private static final long TOKEN_VALIDITY_MINUTES = 15;

    //method 3: login
    @Transactional
    public AuthResponse login(AuthDtoRequest authDtoRequest){

        //1.Check if user exist
        User user = userRepository.findByEmail(authDtoRequest.getEmail());
        if (user == null){
            throw new UserNotExistException("Nom utilisateur ou mot de passe incorrecte!");
        }
        //3.verify user password by calculating hash with sault
        boolean valid = passwordEncoder.matches(authDtoRequest.getPwd(), user.getHash_pwd());

        if (!valid){
            throw new UserPwdNotValidException("Nom utilisateur ou mot de passe incorrecte!");
        }

        // 3. On génère le token JWT
        List<String> permissions = new ArrayList<>();
        for (Permission p : user.getRole().getPermissions()){
            permissions.add(p.getName());
        }
        String token = jwtService.genererToken(user.getEmail(), user.getRole().getName(),permissions);

        // 4. On renvoie le token à l'utilisateur sous forme de JSON
        return new AuthResponse(token);
    }

    //method 4 : log out
    @Transactional
    public String logout(){
        return "déconnecté";
    }

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


        if (user == null) {
            return;
        }


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
                "http://localhost:5173/reset-password?token="
                        + tokenValue;

        emailService.sendPasswordResetEmail(
                user.getEmail(),
                resetLink
        );
    }
}