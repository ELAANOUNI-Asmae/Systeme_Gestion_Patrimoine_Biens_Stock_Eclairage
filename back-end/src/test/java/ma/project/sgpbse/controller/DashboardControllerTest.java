package ma.project.sgpbse.controller;

import ma.project.sgpbse.entity.stock.LowStockAlert;
import ma.project.sgpbse.enums.AssetStatus;
import ma.project.sgpbse.service.DashboardService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DashboardControllerTest {

    @Mock private DashboardService service;
    private DashboardController controller;

    @BeforeEach
    void setUp() {
        controller = new DashboardController(service);
    }

    @Test
    void shouldDelegateDashboardEndpointsToService() {
        LowStockAlert alert = mock(LowStockAlert.class);
        when(service.getConnectedUsernameAr()).thenReturn("فاطمة الزهراء");
        when(service.getConnectedUsernameFr()).thenReturn("Fatima Zahra");
        when(service.getRoleNameOfConnectedUser()).thenReturn("ADMIN");
        when(service.countTotalUsers()).thenReturn(5L);
        when(service.countTotalAssets()).thenReturn(10L);
        when(service.countTotalItems()).thenReturn(12L);
        when(service.countTotalLightPoints()).thenReturn(20L);
        when(service.countTotalAssetsByStatus(AssetStatus.AVAILABLE)).thenReturn(7L);
        when(service.countTotalFailures()).thenReturn(3L);
        when(service.countTotalStockMovementByPeriod(7L)).thenReturn(9L);
        when(service.countTotalLowStockAlerts()).thenReturn(2L);
        when(service.getLowStockAlertsByPeriod(7L)).thenReturn(List.of(alert));

        assertEquals("فاطمة الزهراء", controller.getConnectedUsernameAr().getBody());
        assertEquals("Fatima Zahra", controller.getConnectedUsernameFr().getBody());
        assertEquals("ADMIN", controller.getRoleNameOfConnectedUser().getBody());
        assertEquals(5L, controller.countTotalUsers().getBody());
        assertEquals(10L, controller.countTotalAssets().getBody());
        assertEquals(12L, controller.countTotalItems().getBody());
        assertEquals(20L, controller.countTotalLightPoints().getBody());
        assertEquals(7L, controller.countTotalAssetsByStatus(AssetStatus.AVAILABLE).getBody());
        assertEquals(3L, controller.countTotalFailures().getBody());
        assertEquals(9L, controller.countTotalStockMovementByPeriod(7L).getBody());
        assertEquals(2L, controller.countTotalLowStockAlerts().getBody());
        assertEquals(List.of(alert), controller.getLowStockAlertsByPeriod(7L).getBody());
        assertEquals(HttpStatus.OK, controller.countTotalUsers().getStatusCode());

        verify(service, atLeastOnce()).countTotalUsers();
    }
}
