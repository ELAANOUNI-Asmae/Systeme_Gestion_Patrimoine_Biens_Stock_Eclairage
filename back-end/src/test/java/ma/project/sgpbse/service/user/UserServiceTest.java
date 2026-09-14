package ma.project.sgpbse.service.user;

import ma.project.sgpbse.dto.user.request.ChangePasswordRequest;
import ma.project.sgpbse.dto.user.request.SelfProfileUpdateRequest;
import ma.project.sgpbse.dto.user.response.UserProfilDtoResponse;
import ma.project.sgpbse.entity.user.User;
import ma.project.sgpbse.exception.user.UserNotExistException;
import ma.project.sgpbse.mapper.user.UserMapper;
import ma.project.sgpbse.repository.user.RoleRepository;
import ma.project.sgpbse.repository.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock private PasswordEncoder passwordEncoder;
    @Mock private UserRepository userRepository;
    @Mock private UserMapper userMapper;
    @Mock private RoleRepository roleRepository;
    @Mock private CurrentUserService currentUserService;

    private UserService service;

    @BeforeEach
    void setUp() {
        service = new UserService(passwordEncoder, userRepository, userMapper, roleRepository, currentUserService);
    }

    @Test
    void shouldCountAllUsers() {
        when(userRepository.count()).thenReturn(12L);
        assertEquals(12L, service.countAllUsers());
    }

    @Test
    void shouldUpdateCurrentProfileAndTrimValues() {
        User user = mock(User.class);
        UserProfilDtoResponse response = mock(UserProfilDtoResponse.class);
        when(currentUserService.getCurrentUser()).thenReturn(user);
        when(userRepository.save(user)).thenReturn(user);
        when(userMapper.toDtoProfil(user)).thenReturn(response);

        SelfProfileUpdateRequest request = new SelfProfileUpdateRequest();
        request.setFirstname_fr("  Fatima  ");
        request.setLastname_fr("  Zahra  ");
        request.setFirstname_ar("  فاطمة  ");
        request.setLastname_ar("  الزهراء  ");
        request.setPhone(" 0612345678 ");

        assertSame(response, service.updateCurrentProfile(request));
        verify(user).setFirstname_fr("Fatima");
        verify(user).setLastname_fr("Zahra");
        verify(user).setFirstname_ar("فاطمة");
        verify(user).setLastname_ar("الزهراء");
        verify(user).setPhone("0612345678");
        verify(userRepository).save(user);
    }

    @Test
    void shouldRejectProfileUpdateWhenNoConnectedUser() {
        when(currentUserService.getCurrentUser()).thenReturn(null);
        SelfProfileUpdateRequest request = new SelfProfileUpdateRequest();
        request.setFirstname_fr("A");
        request.setLastname_fr("B");

        assertThrows(UserNotExistException.class, () -> service.updateCurrentProfile(request));
    }

    @Test
    void shouldRejectWrongCurrentPassword() {
        User user = mock(User.class);
        when(currentUserService.getCurrentUser()).thenReturn(user);
        when(user.getHash_pwd()).thenReturn("hash");
        when(passwordEncoder.matches("wrong", "hash")).thenReturn(false);

        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setCurrentPassword("wrong");
        request.setNewPassword("NewPass1!");

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> service.changeCurrentPassword(request)
        );
        assertEquals("CURRENT_PASSWORD_INVALID", ex.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    void shouldRejectSameNewPassword() {
        User user = mock(User.class);
        when(currentUserService.getCurrentUser()).thenReturn(user);
        when(user.getHash_pwd()).thenReturn("hash");
        when(passwordEncoder.matches("OldPass1!", "hash")).thenReturn(true);
        when(passwordEncoder.matches("NewPass1!", "hash")).thenReturn(true);

        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setCurrentPassword("OldPass1!");
        request.setNewPassword("NewPass1!");

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> service.changeCurrentPassword(request)
        );
        assertEquals("NEW_PASSWORD_MUST_BE_DIFFERENT", ex.getMessage());
    }

    @Test
    void shouldChangeCurrentPassword() {
        User user = mock(User.class);
        when(currentUserService.getCurrentUser()).thenReturn(user);
        when(user.getHash_pwd()).thenReturn("old-hash");
        when(passwordEncoder.matches("OldPass1!", "old-hash")).thenReturn(true);
        when(passwordEncoder.matches("NewPass1!", "old-hash")).thenReturn(false);
        when(passwordEncoder.encode("NewPass1!")).thenReturn("new-hash");

        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setCurrentPassword("OldPass1!");
        request.setNewPassword("NewPass1!");

        service.changeCurrentPassword(request);

        verify(user).setHash_pwd("new-hash");
        verify(userRepository).save(user);
    }
}
