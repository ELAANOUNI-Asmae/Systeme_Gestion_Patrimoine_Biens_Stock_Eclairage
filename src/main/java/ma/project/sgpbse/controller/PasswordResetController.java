package ma.project.sgpbse.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.project.sgpbse.dto.request.ForgotPasswordRequest;
import ma.project.sgpbse.dto.request.ResetPasswordRequest;
import ma.project.sgpbse.service.user.PasswordResetService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/password")
@RequiredArgsConstructor
public class PasswordResetController {

    private final PasswordResetService passwordResetService;

    @PostMapping("/forgot")
    public ResponseEntity<String> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request
    ) {

        passwordResetService.requestPasswordReset(
                request.getEmail()
        );

        return ResponseEntity.ok(
                "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé."
        );
    }

    @PostMapping("/reset")
    public ResponseEntity<String> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request
    ) {

        passwordResetService.resetPassword(request);

        return ResponseEntity.ok(
                "Mot de passe réinitialisé avec succès."
        );
    }
}