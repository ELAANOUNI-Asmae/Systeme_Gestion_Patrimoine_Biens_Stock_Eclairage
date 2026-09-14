package ma.project.sgpbse.service.asset;

import ma.project.sgpbse.dto.asset.request.VehicleRequestDto;
import ma.project.sgpbse.dto.asset.response.VehicleResponseDto;
import ma.project.sgpbse.entity.asset.Vehicle;
import ma.project.sgpbse.enums.AssetStatus;
import ma.project.sgpbse.exception.asset.VehicleNotExistException;
import ma.project.sgpbse.mapper.asset.VehicleMapper;
import ma.project.sgpbse.repository.asset.VehicleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VehicleServiceTest {

    @Mock private VehicleRepository repository;
    @Mock private VehicleMapper mapper;
    @Mock private AssetService assetService;
    private VehicleService service;

    @BeforeEach
    void setUp() {
        service = new VehicleService(repository, mapper, assetService);
    }

    @Test
    void shouldCreateAvailableVehicleWhenAssignmentBlank() {
        VehicleRequestDto dto = mock(VehicleRequestDto.class);
        Vehicle entity = mock(Vehicle.class);
        when(dto.getAssignment()).thenReturn("");
        when(mapper.toEntity(dto)).thenReturn(entity);
        when(mapper.toDto(entity)).thenReturn(mock(VehicleResponseDto.class));
        service.createVehicle(dto);
        verify(entity).setAssetStatus(AssetStatus.AVAILABLE);
        verify(repository).save(entity);
    }

    @Test
    void shouldCreateInUseVehicleWhenAssigned() {
        VehicleRequestDto dto = mock(VehicleRequestDto.class);
        Vehicle entity = mock(Vehicle.class);
        when(dto.getAssignment()).thenReturn("Service Voirie");
        when(mapper.toEntity(dto)).thenReturn(entity);
        when(mapper.toDto(entity)).thenReturn(mock(VehicleResponseDto.class));
        service.createVehicle(dto);
        verify(entity).setAssetStatus(AssetStatus.IN_USE);
    }

    @Test
    void shouldUpdateVehicle() {
        Vehicle entity = mock(Vehicle.class);
        VehicleRequestDto dto = mock(VehicleRequestDto.class);
        when(repository.findById(8L)).thenReturn(Optional.of(entity));
        when(entity.getId()).thenReturn(8L);
        assertEquals(8L, service.updateVehicle(8L, dto));
        verify(mapper).updateEntityFromDto(dto, entity);
        verify(repository).save(entity);
    }

    @Test
    void shouldRejectUnknownVehicle() {
        when(repository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(VehicleNotExistException.class, () -> service.getVehicleById(99L));
    }

    @Test
    void shouldDeleteVehicle() {
        when(repository.findById(4L)).thenReturn(Optional.of(mock(Vehicle.class)));
        assertEquals("Successfully deleted !", service.deleteVehicle(4L));
        verify(repository).deleteById(4L);
    }

    @Test
    void shouldGetVehicleWithDocuments() {
        Vehicle entity = mock(Vehicle.class);
        VehicleResponseDto response = mock(VehicleResponseDto.class);
        when(repository.findById(2L)).thenReturn(Optional.of(entity));
        when(entity.getId()).thenReturn(2L);
        when(mapper.toDto(entity)).thenReturn(response);
        when(assetService.getAllDocuments(2L)).thenReturn(Set.of());
        assertSame(response, service.getVehicle(2L));
        verify(response).setDocumentResponseDtoSet(Set.of());
    }

    @Test
    void shouldDelegateVehicleStatusUpdate() {
        service.updateVehicleStatus(3L, AssetStatus.DAMAGED);
        verify(assetService).updateStatus(3L, AssetStatus.DAMAGED);
    }

    @Test
    void shouldGetAllVehicles() {
        List<Vehicle> entities = List.of(mock(Vehicle.class));
        List<VehicleResponseDto> expected = List.of(mock(VehicleResponseDto.class));
        when(repository.findAll()).thenReturn(entities);
        when(mapper.toDtos(entities)).thenReturn(expected);
        assertEquals(expected, service.getAllVehicles());
    }
}
