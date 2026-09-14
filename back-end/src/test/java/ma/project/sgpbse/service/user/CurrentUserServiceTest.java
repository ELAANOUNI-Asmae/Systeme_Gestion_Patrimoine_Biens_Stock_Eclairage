package ma.project.sgpbse.service.user;

import ma.project.sgpbse.entity.user.User;
import ma.project.sgpbse.repository.user.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CurrentUserServiceTest {

    @Mock private UserRepository userRepository;
    private CurrentUserService service;

    @BeforeEach
    void setUp() {
        service = new CurrentUserService(userRepository);
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void shouldResolveCurrentUserFromUserDetailsPrincipal() {
        UserDetails principal = mock(UserDetails.class);
        User expected = mock(User.class);
        when(principal.getUsername()).thenReturn("agent@sgpbse.ma");
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(principal, null)
        );
        when(userRepository.findByEmail("agent@sgpbse.ma")).thenReturn(expected);

        assertSame(expected, service.getCurrentUser());
    }

    @Test
    void shouldResolveCurrentUserFromStringPrincipal() {
        User expected = mock(User.class);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("admin@sgpbse.ma", null)
        );
        when(userRepository.findByEmail("admin@sgpbse.ma")).thenReturn(expected);

        assertSame(expected, service.getCurrentUser());
    }
}
