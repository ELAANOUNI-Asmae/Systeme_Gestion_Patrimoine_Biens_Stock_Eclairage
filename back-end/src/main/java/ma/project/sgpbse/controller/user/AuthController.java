package ma.project.sgpbse.controller.user;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.project.sgpbse.dto.user.request.AuthDtoRequest;
import ma.project.sgpbse.dto.user.request.ForgotPasswordRequest;
import ma.project.sgpbse.dto.user.request.ResetPasswordRequest;
import ma.project.sgpbse.service.jwt.AuthResponse;
import ma.project.sgpbse.service.user.AuthService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/sgpbse/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService passwordResetService;
    private final AuthService authService;

    //method 4 : login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody @Valid AuthDtoRequest authDtoRequest, HttpServletResponse response) {

        AuthResponse authResponse = authService.login(authDtoRequest);

        ResponseCookie cookie = ResponseCookie.from("jwt-token", authResponse.accessToken())
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(86400)
                .sameSite("Strict")
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body("Connexion réusiite !");
    }

    //method 3 : log out
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {

        ResponseCookie deleteCookie = ResponseCookie.from("jwt-token", "")
                .httpOnly(true)
                .secure(false) // À mettre à false si tu es en local sans HTTPS ou bien true pour la production
                .path("/")
                .maxAge(0)    // <--- C'est ça qui force le navigateur à supprimer le cookie immédiatement !
                .sameSite("Strict")
                .build();
        // On renvoie ce cookie dans les en-têtes de la réponse
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, deleteCookie.toString())
                .body("Déconnexion réussie !");
    }

    @PostMapping("/forgot_password")
    public ResponseEntity<String> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {

        passwordResetService.requestPasswordReset(
                request.getEmail()
        );

        return ResponseEntity.ok("Si un compte existe avec cet email, un lien de réinitialisation a été envoyé."
        );
    }

    @PostMapping("/reset_password")
    public ResponseEntity<String> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {

        passwordResetService.resetPassword(request);

        return ResponseEntity.ok(
                "Mot de passe réinitialisé avec succès."
        );
    }
}