package ma.project.sgpbse.service.stock;

import ma.project.sgpbse.entity.stock.Item;
import ma.project.sgpbse.entity.stock.LowStockAlert;
import ma.project.sgpbse.repository.stock.LowStockAlertRepository;
import ma.project.sgpbse.service.NotificationService;
import ma.project.sgpbse.service.user.CurrentUserService;
import ma.project.sgpbse.service.user.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LowStockAlertServiceTest {

    @Mock private LowStockAlertRepository repository;
    @Mock private NotificationService notificationService;
    @Mock private CurrentUserService currentUserService;
    @Mock private UserService userService;

    private LowStockAlertService service;

    @BeforeEach
    void setUp() {
        service = new LowStockAlertService(repository, notificationService, currentUserService, userService);
        lenient().when(repository.save(any(LowStockAlert.class))).thenAnswer(i -> i.getArgument(0));
    }

    @Test
    void shouldCreateAlertWhenStockFallsBelowThreshold() {
        Item item = item(1L, "Papier", 2L, 5L);
        when(repository.findByItemIdAndResolvedFalseAndManualRequestFalse(1L)).thenReturn(Optional.empty());

        service.checkAndManageStockAlert(item);

        ArgumentCaptor<LowStockAlert> captor = ArgumentCaptor.forClass(LowStockAlert.class);
        verify(repository).save(captor.capture());
        assertFalse(captor.getValue().isResolved());
        assertEquals(2L, captor.getValue().getQuantity());
        verify(notificationService).notifyUsersWithPermission(
                eq("READ_STOCK_ALERTS"),
                eq("Alerte Stock Bas"),
                contains("Papier")
        );
    }

    @Test
    void shouldUpdateExistingLowStockAlertWithoutDuplicatingNotification() {
        Item item = item(1L, "Papier", 1L, 5L);
        LowStockAlert existing = LowStockAlert.builder().id(10L).item(item).resolved(false).manualRequest(false).build();
        when(repository.findByItemIdAndResolvedFalseAndManualRequestFalse(1L)).thenReturn(Optional.of(existing));

        service.checkAndManageStockAlert(item);

        assertEquals(1L, existing.getQuantity());
        verify(repository).save(existing);
        verify(notificationService, never()).notifyUsersWithPermission(anyString(), anyString(), anyString());
    }

    @Test
    void shouldResolveAlertWhenStockRecovers() {
        Item item = item(1L, "Papier", 20L, 5L);
        LowStockAlert existing = LowStockAlert.builder().id(10L).item(item).resolved(false).manualRequest(false).build();
        when(repository.findByItemIdAndResolvedFalseAndManualRequestFalse(1L)).thenReturn(Optional.of(existing));

        service.checkAndManageStockAlert(item);

        assertTrue(existing.isResolved());
        verify(repository).save(existing);
    }

    @Test
    void shouldCountOnlyOpenAutomaticAlerts() {
        when(repository.countByResolvedFalseAndManualRequestFalse()).thenReturn(4L);
        assertEquals(4L, service.countAllLowStockAlerts());
        assertEquals(4L, service.countAllAlerts());
        verify(repository, times(2)).countByResolvedFalseAndManualRequestFalse();
    }

    private Item item(Long id, String name, Long quantity, Long threshold) {
        Item item = new Item();
        item.setId(id);
        item.setName(name);
        item.setQuantity(quantity);
        item.setAlertThreshold(threshold);
        return item;
    }
}
