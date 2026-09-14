package ma.project.sgpbse.service;

import ma.project.sgpbse.dto.notification.NotificationResponseDto;
import ma.project.sgpbse.entity.Notification;
import ma.project.sgpbse.entity.user.User;
import ma.project.sgpbse.repository.NotificationRepository;
import ma.project.sgpbse.repository.user.UserRepository;
import ma.project.sgpbse.service.user.CurrentUserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock private NotificationRepository notificationRepository;
    @Mock private UserRepository userRepository;
    @Mock private CurrentUserService currentUserService;

    private NotificationService service;

    @BeforeEach
    void setUp() {
        service = new NotificationService(notificationRepository, userRepository, currentUserService);
        lenient().when(notificationRepository.save(any(Notification.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void shouldRejectNotificationWithoutReceiver() {
        assertThrows(IllegalArgumentException.class,
                () -> service.sendDirectNotification(null, null, "Titre", "Message"));
        verify(notificationRepository, never()).save(any());
    }

    @Test
    void shouldCreateUnreadDirectNotificationWithDefaults() {
        User receiver = mock(User.class);

        Notification saved = service.sendDirectNotification(null, receiver, null, null);

        assertEquals("Notification", saved.getTitle());
        assertEquals("", saved.getMessage());
        assertFalse(saved.getReadStatus());
        assertSame(receiver, saved.getReceiver());
        assertNull(saved.getSender());
        assertNotNull(saved.getCreatedAt());
        verify(notificationRepository).save(saved);
    }

    @Test
    void shouldIgnoreBlankPermission() {
        service.notifyUsersWithPermission("   ", "Titre", "Message");
        verifyNoInteractions(userRepository);
        verify(notificationRepository, never()).save(any());
    }

    @Test
    void shouldNotifyAllUsersHavingPermission() {
        User u1 = mock(User.class);
        User u2 = mock(User.class);
        when(userRepository.findAllByPermissionName("READ_STOCK_ALERTS")).thenReturn(List.of(u1, u2));

        service.notifyUsersWithPermission("READ_STOCK_ALERTS", "Alerte", "Stock bas");

        verify(notificationRepository, times(2)).save(any(Notification.class));
    }

    @Test
    void shouldReturnCurrentUserNotificationsAsDtos() {
        User current = mock(User.class);
        when(current.getId()).thenReturn(7L);
        when(currentUserService.getCurrentUser()).thenReturn(current);

        Notification n = new Notification();
        n.setId(3L);
        n.setTitle("Test");
        n.setMessage("Message");
        n.setCreatedAt(LocalDateTime.now());
        n.setReadStatus(false);
        when(notificationRepository.findByReceiver_IdOrderByCreatedAtDesc(7L)).thenReturn(List.of(n));

        List<NotificationResponseDto> result = service.getCurrentUserNotifications();

        assertEquals(1, result.size());
        assertEquals(3L, result.get(0).getId());
        assertEquals("Test", result.get(0).getTitle());
        assertFalse(result.get(0).getReadStatus());
    }

    @Test
    void shouldCountUnreadNotificationsForCurrentUser() {
        User current = mock(User.class);
        when(current.getId()).thenReturn(7L);
        when(currentUserService.getCurrentUser()).thenReturn(current);
        when(notificationRepository.countByReceiver_IdAndReadStatusFalse(7L)).thenReturn(4L);

        assertEquals(4L, service.countUnreadCurrentUserNotifications());
    }

    @Test
    void shouldMarkOnlyOwnedNotificationAsRead() {
        User current = mock(User.class);
        when(current.getId()).thenReturn(7L);
        when(currentUserService.getCurrentUser()).thenReturn(current);

        Notification n = new Notification();
        n.setId(9L);
        n.setTitle("X");
        n.setMessage("Y");
        n.setCreatedAt(LocalDateTime.now());
        n.setReadStatus(false);
        when(notificationRepository.findByIdAndReceiver_Id(9L, 7L)).thenReturn(Optional.of(n));

        NotificationResponseDto result = service.markCurrentUserAsRead(9L);

        assertTrue(n.getReadStatus());
        assertTrue(result.getReadStatus());
        verify(notificationRepository).save(n);
    }

    @Test
    void shouldRejectAccessToNotificationOwnedByAnotherUser() {
        User current = mock(User.class);
        when(current.getId()).thenReturn(7L);
        when(currentUserService.getCurrentUser()).thenReturn(current);
        when(notificationRepository.findByIdAndReceiver_Id(99L, 7L)).thenReturn(Optional.empty());

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> service.markCurrentUserAsRead(99L)
        );
        assertEquals("NOTIFICATION_NOT_FOUND", ex.getMessage());
    }
}
