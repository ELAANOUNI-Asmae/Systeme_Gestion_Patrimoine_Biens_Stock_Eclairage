package ma.project.sgpbse.service;

import ma.project.sgpbse.entity.stock.LowStockAlert;
import ma.project.sgpbse.entity.user.Role;
import ma.project.sgpbse.entity.user.User;
import ma.project.sgpbse.enums.AssetStatus;
import ma.project.sgpbse.service.asset.AssetService;
import ma.project.sgpbse.service.publicLighting.FailureService;
import ma.project.sgpbse.service.publicLighting.LightPointService;
import ma.project.sgpbse.service.stock.ItemService;
import ma.project.sgpbse.service.stock.LowStockAlertService;
import ma.project.sgpbse.service.stock.StockMovementService;
import ma.project.sgpbse.service.user.CurrentUserService;
import ma.project.sgpbse.service.user.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock private CurrentUserService currentUserService;
    @Mock private UserService userService;
    @Mock private AssetService assetService;
    @Mock private ItemService itemService;
    @Mock private LightPointService lightPointService;
    @Mock private FailureService failureService;
    @Mock private LowStockAlertService lowStockAlertService;
    @Mock private StockMovementService stockMovementService;

    private DashboardService service;

    @BeforeEach
    void setUp() {
        service = new DashboardService(
                currentUserService,
                userService,
                assetService,
                itemService,
                lightPointService,
                failureService,
                lowStockAlertService,
                stockMovementService
        );
    }

    @Test
    void shouldReturnConnectedUserNamesAndRole() {
        User user = mock(User.class);
        Role role = mock(Role.class);
        when(currentUserService.getCurrentUser()).thenReturn(user);
        when(user.getFirstname_fr()).thenReturn("Fatima");
        when(user.getLastname_fr()).thenReturn("Zahra");
        when(user.getFirstname_ar()).thenReturn("فاطمة");
        when(user.getLastname_ar()).thenReturn("الزهراء");
        when(user.getRole()).thenReturn(role);
        when(role.getName()).thenReturn("ADMIN");

        assertEquals("Fatima Zahra", service.getConnectedUsernameFr());
        assertEquals("فاطمة الزهراء", service.getConnectedUsernameAr());
        assertEquals("ADMIN", service.getRoleNameOfConnectedUser());
    }

    @Test
    void shouldDelegateDashboardCounters() {
        when(userService.countAllUsers()).thenReturn(10L);
        when(assetService.countAllAssets()).thenReturn(20L);
        when(itemService.countAllItems()).thenReturn(30L);
        when(lightPointService.countAllLightPoints()).thenReturn(40L);
        when(failureService.countAllFailures()).thenReturn(5L);
        when(lowStockAlertService.countAllLowStockAlerts()).thenReturn(3L);
        when(stockMovementService.countAllStockMovementByPeriod(7L)).thenReturn(8L);
        when(assetService.countAllAssetsByStatus(AssetStatus.AVAILABLE)).thenReturn(12L);

        assertEquals(10L, service.countTotalUsers());
        assertEquals(20L, service.countTotalAssets());
        assertEquals(30L, service.countTotalItems());
        assertEquals(40L, service.countTotalLightPoints());
        assertEquals(5L, service.countTotalFailures());
        assertEquals(3L, service.countTotalLowStockAlerts());
        assertEquals(8L, service.countTotalStockMovementByPeriod(7L));
        assertEquals(12L, service.countTotalAssetsByStatus(AssetStatus.AVAILABLE));
    }

    @Test
    void shouldReturnRecentLowStockAlerts() {
        LowStockAlert alert = mock(LowStockAlert.class);
        when(lowStockAlertService.getLowStockAlertsByPeriod(7L)).thenReturn(List.of(alert));

        assertEquals(List.of(alert), service.getLowStockAlertsByPeriod(7L));
        verify(lowStockAlertService).getLowStockAlertsByPeriod(7L);
    }
}
