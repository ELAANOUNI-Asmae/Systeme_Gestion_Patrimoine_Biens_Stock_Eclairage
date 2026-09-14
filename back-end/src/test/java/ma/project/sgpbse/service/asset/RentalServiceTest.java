package ma.project.sgpbse.service.asset;

import ma.project.sgpbse.dto.asset.request.RentalRequestDto;
import ma.project.sgpbse.dto.asset.response.RentalResponseDto;
import ma.project.sgpbse.entity.asset.Asset;
import ma.project.sgpbse.entity.asset.Rental;
import ma.project.sgpbse.enums.AssetStatus;
import ma.project.sgpbse.enums.RentalStatus;
import ma.project.sgpbse.exception.asset.RentalNotExistException;
import ma.project.sgpbse.mapper.asset.RentalMapper;
import ma.project.sgpbse.repository.asset.RentalRepository;
import ma.project.sgpbse.service.NotificationService;
import ma.project.sgpbse.service.user.CurrentUserService;
import ma.project.sgpbse.service.user.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RentalServiceTest {

    @Mock private AssetService assetService;
    @Mock private RentalRepository repository;
    @Mock private RentalMapper mapper;
    @Mock private DocumentService<?> documentService;
    @Mock private UserService userService;
    @Mock private NotificationService notificationService;
    @Mock private CurrentUserService currentUserService;
    private RentalService service;

    @BeforeEach
    void setUp() {
        service = new RentalService(assetService, repository, mapper, documentService,
                userService, notificationService, currentUserService);
    }

    @Test
    void shouldRejectRentalWhenAssetNotAvailable() {
        Asset asset = mock(Asset.class);
        when(assetService.getAssetById(1L)).thenReturn(asset);
        when(asset.getAssetStatus()).thenReturn(AssetStatus.IN_USE);
        assertThrows(IllegalStateException.class,
                () -> service.createRental(1L, mock(RentalRequestDto.class)));
    }

    @Test
    void shouldCreateRentalForAvailableAsset() {
        Asset asset = mock(Asset.class);
        Rental rental = mock(Rental.class);
        RentalRequestDto dto = mock(RentalRequestDto.class);
        when(assetService.getAssetById(1L)).thenReturn(asset);
        when(asset.getAssetStatus()).thenReturn(AssetStatus.AVAILABLE);
        when(asset.getDesignation()).thenReturn("Local communal");
        when(mapper.toEntity(dto)).thenReturn(rental);
        when(rental.getTenantName()).thenReturn("Association");
        when(rental.getId()).thenReturn(6L);
        when(userService.filterByPermissionName("GET_RENTAL_NOTIFICATION")).thenReturn(List.of());
        when(currentUserService.getCurrentUser()).thenReturn(mock(ma.project.sgpbse.entity.user.User.class));

        assertEquals(6L, service.createRental(1L, dto));
        verify(rental).setAsset(asset);
        verify(repository).save(rental);
        verify(assetService).addRentalToAsset(asset, rental);
        verify(assetService).updateStatus(1L, AssetStatus.RENTED);
    }

    @Test
    void shouldRejectDeletingActiveRental() {
        Rental rental = mock(Rental.class);
        when(repository.findById(3L)).thenReturn(Optional.of(rental));
        when(rental.getRentalStatus()).thenReturn(RentalStatus.ACTIVE);
        assertThrows(IllegalStateException.class, () -> service.deleteRental(3L));
    }

    @Test
    void shouldDeleteNonActiveRentalAndReleaseAsset() {
        Rental rental = mock(Rental.class);
        Asset asset = mock(Asset.class);
        when(repository.findById(3L)).thenReturn(Optional.of(rental));
        when(rental.getRentalStatus()).thenReturn(RentalStatus.PLANNED);
        when(rental.getAsset()).thenReturn(asset);
        when(asset.getId()).thenReturn(9L);

        assertEquals("Success!", service.deleteRental(3L));
        verify(repository).deleteById(3L);
        verify(assetService).updateStatus(9L, AssetStatus.AVAILABLE);
    }

    @Test
    void shouldUpdateRental() {
        Rental rental = mock(Rental.class);
        RentalRequestDto dto = mock(RentalRequestDto.class);
        when(repository.findById(4L)).thenReturn(Optional.of(rental));
        assertEquals("Success!", service.updateRental(4L, dto));
        verify(mapper).updateEntityFromDto(dto, rental);
        verify(repository).save(rental);
    }

    @Test
    void shouldGetRental() {
        Rental rental = mock(Rental.class);
        RentalResponseDto response = mock(RentalResponseDto.class);
        when(repository.findById(5L)).thenReturn(Optional.of(rental));
        when(mapper.toDto(rental)).thenReturn(response);
        assertSame(response, service.getRental(5L));
    }

    @Test
    void shouldRejectUnknownRental() {
        when(repository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(RentalNotExistException.class, () -> service.getRentalById(99L));
    }

    @Test
    void shouldGetAllRentals() {
        List<Rental> entities = List.of(mock(Rental.class));
        List<RentalResponseDto> expected = List.of(mock(RentalResponseDto.class));
        when(repository.findAll()).thenReturn(entities);
        when(mapper.toDtos(entities)).thenReturn(expected);
        assertEquals(expected, service.getAllRentals());
    }
}
