package ma.project.sgpbse.service.asset;

import ma.project.sgpbse.dto.asset.request.MaintenanceRequestDto;
import ma.project.sgpbse.dto.asset.response.MaintenanceResponseDto;
import ma.project.sgpbse.entity.asset.Asset;
import ma.project.sgpbse.entity.asset.Maintenance;
import ma.project.sgpbse.enums.AssetStatus;
import ma.project.sgpbse.enums.MaintenanceStatus;
import ma.project.sgpbse.exception.asset.MaintenanceNotExistException;
import ma.project.sgpbse.mapper.asset.MaintenanceMapper;
import ma.project.sgpbse.repository.asset.MaintenanceRepository;
import ma.project.sgpbse.service.NotificationService;
import ma.project.sgpbse.service.user.CurrentUserService;
import ma.project.sgpbse.service.user.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MaintenanceServiceTest {

    @Mock private MaintenanceRepository repository;
    @Mock private MaintenanceMapper mapper;
    @Mock private AssetService assetService;
    @Mock private DocumentService<?> documentService;
    @Mock private UserService userService;
    @Mock private NotificationService notificationService;
    @Mock private CurrentUserService currentUserService;
    private MaintenanceService service;

    @BeforeEach
    void setUp() {
        service = new MaintenanceService(repository, mapper, assetService, documentService,
                userService, notificationService, currentUserService);
    }

    @Test
    void shouldScheduleMaintenance() {
        Asset asset = mock(Asset.class);
        Maintenance maintenance = mock(Maintenance.class);
        MaintenanceRequestDto dto = mock(MaintenanceRequestDto.class);
        when(assetService.getAssetById(1L)).thenReturn(asset);
        when(asset.getDesignation()).thenReturn("Serveur");
        when(mapper.toEntity(dto)).thenReturn(maintenance);
        when(maintenance.getScheduledDate()).thenReturn(LocalDate.now().plusDays(2));
        when(maintenance.getId()).thenReturn(7L);
        when(userService.filterByPermissionName("GET_MAINTENANCE_NOTIFICATION")).thenReturn(List.of());
        when(currentUserService.getCurrentUser()).thenReturn(mock(ma.project.sgpbse.entity.user.User.class));

        assertEquals(7L, service.scheduleMaintenance(1L, dto));
        verify(maintenance).setMaintenanceStatus(MaintenanceStatus.PLANNED);
        verify(repository).save(maintenance);
        verify(assetService).addMaintenanceToAsset(asset, maintenance);
        verify(assetService).updateStatus(1L, AssetStatus.DAMAGED);
    }

    @Test
    void shouldRejectStartingMaintenanceThatIsNotPlanned() {
        Maintenance maintenance = mock(Maintenance.class);
        when(repository.findById(2L)).thenReturn(Optional.of(maintenance));
        when(maintenance.getMaintenanceStatus()).thenReturn(MaintenanceStatus.CANCELLED);
        assertThrows(RuntimeException.class, () -> service.startMaintenance(2L));
    }

    @Test
    void shouldStartPlannedMaintenance() {
        Maintenance maintenance = mock(Maintenance.class);
        Asset asset = mock(Asset.class);
        when(repository.findById(2L)).thenReturn(Optional.of(maintenance));
        when(maintenance.getMaintenanceStatus()).thenReturn(MaintenanceStatus.PLANNED);
        when(maintenance.getAsset()).thenReturn(asset);
        when(asset.getId()).thenReturn(10L);
        when(asset.getDesignation()).thenReturn("Imprimante");
        when(userService.filterByPermissionName("GET_MAINTENANCE_NOTIFICATION")).thenReturn(List.of());
        when(currentUserService.getCurrentUser()).thenReturn(mock(ma.project.sgpbse.entity.user.User.class));

        assertTrue(service.startMaintenance(2L).contains("successfully started"));
        verify(maintenance).setStartDate(any(LocalDate.class));
        verify(maintenance).setMaintenanceStatus(MaintenanceStatus.IN_PROGRESS);
        verify(assetService).updateStatus(10L, AssetStatus.UNDER_MAINTENANCE);
        verify(repository).save(maintenance);
    }

    @Test
    void shouldUpdateMaintenanceStatus() {
        Maintenance maintenance = mock(Maintenance.class);
        when(repository.findById(3L)).thenReturn(Optional.of(maintenance));
        assertEquals("successfully updated !", service.updateMaintenanceStatus(3L, "CANCELLED"));
        verify(maintenance).setMaintenanceStatus(MaintenanceStatus.CANCELLED);
        verify(repository).save(maintenance);
    }

    @Test
    void shouldGetMaintenance() {
        Maintenance maintenance = mock(Maintenance.class);
        MaintenanceResponseDto response = mock(MaintenanceResponseDto.class);
        when(repository.findById(4L)).thenReturn(Optional.of(maintenance));
        when(mapper.toDto(maintenance)).thenReturn(response);
        assertSame(response, service.getMaintenance(4L));
    }

    @Test
    void shouldRejectUnknownMaintenance() {
        when(repository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(MaintenanceNotExistException.class, () -> service.getMaintenanceById(99L));
    }

    @Test
    void shouldGetAllMaintenances() {
        List<Maintenance> entities = List.of(mock(Maintenance.class));
        List<MaintenanceResponseDto> expected = List.of(mock(MaintenanceResponseDto.class));
        when(repository.findAll()).thenReturn(entities);
        when(mapper.toDtoList(entities)).thenReturn(expected);
        assertEquals(expected, service.getAllMaintenances());
    }
}
