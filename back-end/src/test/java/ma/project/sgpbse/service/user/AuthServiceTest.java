package ma.project.sgpbse.service.user;

import ma.project.sgpbse.dto.user.request.AuthDtoRequest;
import ma.project.sgpbse.dto.user.request.ResetPasswordRequest;
import ma.project.sgpbse.entity.user.Permission;
import ma.project.sgpbse.entity.user.Role;
import ma.project.sgpbse.entity.user.User;
import ma.project.sgpbse.exception.user.AccountInactiveException;
import ma.project.sgpbse.exception.user.UserNotExistException;
import ma.project.sgpbse.exception.user.UserPwdNotValidException;
import ma.project.sgpbse.repository.user.PasswordResetTokenRepository;
import ma.project.sgpbse.repository.user.UserRepository;
import ma.project.sgpbse.service.jwt.AuthResponse;
import ma.project.sgpbse.service.jwt.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashSet;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private JwtService jwtService;
    @Mock private UserRepository userRepository;
    @Mock private PasswordResetTokenRepository tokenRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private EmailService emailService;

    private AuthService service;

    @BeforeEach
    void setUp() {
        service = new AuthService(jwtService, userRepository, tokenRepository, passwordEncoder, emailService);
    }

    @Test
    void shouldRejectUnknownUserAtLogin() {
        AuthDtoRequest request = mock(AuthDtoRequest.class);
        when(request.getEmail()).thenReturn("unknown@test.com");
        when(userRepository.findByEmail("unknown@test.com")).thenReturn(null);

        assertThrows(UserNotExistException.class, () -> service.login(request));
    }

    @Test
    void shouldRejectWrongPasswordAtLogin() {
        AuthDtoRequest request = mock(AuthDtoRequest.class);
        User user = mock(User.class);
        when(request.getEmail()).thenReturn("user@test.com");
        when(request.getPwd()).thenReturn("wrong");
        when(userRepository.findByEmail("user@test.com")).thenReturn(user);
        when(user.getHash_pwd()).thenReturn("hash");
        when(passwordEncoder.matches("wrong", "hash")).thenReturn(false);

        assertThrows(UserPwdNotValidException.class, () -> service.login(request));
    }

    @Test
    void shouldRejectInactiveAccountAtLogin() {
        AuthDtoRequest request = mock(AuthDtoRequest.class);
        User user = mock(User.class);

        when(request.getEmail()).thenReturn("inactive@test.com");
        when(request.getPwd()).thenReturn("Pass1!");
        when(userRepository.findByEmail("inactive@test.com")).thenReturn(user);
        when(user.getHash_pwd()).thenReturn("hash");
        when(passwordEncoder.matches("Pass1!", "hash")).thenReturn(true);
        when(user.isEnabled()).thenReturn(false);

        assertThrows(AccountInactiveException.class, () -> service.login(request));
        verifyNoInteractions(jwtService);
    }

    @Test
    void shouldLoginAndGenerateJwtWithPermissions() {
        AuthDtoRequest request = mock(AuthDtoRequest.class);
        User user = mock(User.class);
        Permission permission = Permission.builder().name("GET_ALL_ITEMS").build();
        Role role = Role.builder()
                .name("ADMIN")
                .permissions(new HashSet<>(List.of(permission)))
                .build();

        when(request.getEmail()).thenReturn("user@test.com");
        when(request.getPwd()).thenReturn("Pass1!");
        when(userRepository.findByEmail("user@test.com")).thenReturn(user);
        when(user.getHash_pwd()).thenReturn("hash");
        when(user.isEnabled()).thenReturn(true);
        when(user.getEmail()).thenReturn("user@test.com");
        when(user.getRole()).thenReturn(role);
        when(passwordEncoder.matches("Pass1!", "hash")).thenReturn(true);
        when(jwtService.genererToken("user@test.com", "ADMIN", List.of("GET_ALL_ITEMS")))
                .thenReturn("jwt-token");

        AuthResponse response = service.login(request);

        assertEquals("jwt-token", response.accessToken());
        verify(jwtService).genererToken("user@test.com", "ADMIN", List.of("GET_ALL_ITEMS"));
    }

    @Test
    void shouldRejectResetPasswordWhenConfirmationDiffers() {
        ResetPasswordRequest request = mock(ResetPasswordRequest.class);
        when(request.getNewPassword()).thenReturn("NewPass1!");
        when(request.getConfirmPassword()).thenReturn("OtherPass1!");

        assertThrows(IllegalArgumentException.class, () -> service.resetPassword(request));
        verifyNoInteractions(tokenRepository);
    }

    @Test
    void shouldNotRevealUnknownEmailDuringPasswordResetRequest() {
        when(userRepository.findByEmail("missing@test.com")).thenReturn(null);

        assertDoesNotThrow(() -> service.requestPasswordReset("missing@test.com"));
        verifyNoInteractions(tokenRepository);
        verifyNoInteractions(emailService);
    }
}
