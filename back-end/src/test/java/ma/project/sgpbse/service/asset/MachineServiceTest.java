package ma.project.sgpbse.service.asset;

import ma.project.sgpbse.dto.asset.request.MachineRequestDto;
import ma.project.sgpbse.dto.asset.response.MachineResponseDto;
import ma.project.sgpbse.entity.asset.Machine;
import ma.project.sgpbse.enums.AssetStatus;
import ma.project.sgpbse.exception.asset.MachineNotExistException;
import ma.project.sgpbse.mapper.asset.MachineMapper;
import ma.project.sgpbse.repository.asset.MachineRepository;
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
class MachineServiceTest {

    @Mock private MachineRepository repository;
    @Mock private MachineMapper mapper;
    @Mock private AssetService assetService;
    private MachineService service;

    @BeforeEach
    void setUp() {
        service = new MachineService(repository, mapper, assetService);
    }

    @Test
    void shouldCreateAvailableMachineWhenAssignmentBlank() {
        MachineRequestDto dto = mock(MachineRequestDto.class);
        Machine entity = mock(Machine.class);
        MachineResponseDto response = mock(MachineResponseDto.class);
        when(dto.getAssignment()).thenReturn(null);
        when(mapper.toEntity(dto)).thenReturn(entity);
        when(mapper.toDto(entity)).thenReturn(response);

        assertSame(response, service.createMachine(dto));
        verify(entity).setAssetStatus(AssetStatus.AVAILABLE);
        verify(repository).save(entity);
    }

    @Test
    void shouldCreateInUseMachineWhenAssigned() {
        MachineRequestDto dto = mock(MachineRequestDto.class);
        Machine entity = mock(Machine.class);
        when(dto.getAssignment()).thenReturn("Atelier");
        when(mapper.toEntity(dto)).thenReturn(entity);
        when(mapper.toDto(entity)).thenReturn(mock(MachineResponseDto.class));
        service.createMachine(dto);
        verify(entity).setAssetStatus(AssetStatus.IN_USE);
    }

    @Test
    void shouldUpdateMachine() {
        Machine entity = mock(Machine.class);
        MachineRequestDto dto = mock(MachineRequestDto.class);
        when(repository.findById(5L)).thenReturn(Optional.of(entity));
        when(entity.getId()).thenReturn(5L);
        assertEquals(5L, service.updateMachine(5L, dto));
        verify(mapper).updateEntityFromDto(dto, entity);
        verify(repository).save(entity);
    }

    @Test
    void shouldRejectUnknownMachine() {
        when(repository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(MachineNotExistException.class, () -> service.getMachine(99L));
    }

    @Test
    void shouldDeleteMachine() {
        when(repository.findById(3L)).thenReturn(Optional.of(mock(Machine.class)));
        assertEquals("Successfully deleted !", service.deleteMachine(3L));
        verify(repository).deleteById(3L);
    }

    @Test
    void shouldGetMachineWithDocuments() {
        Machine entity = mock(Machine.class);
        MachineResponseDto response = mock(MachineResponseDto.class);
        when(repository.findById(2L)).thenReturn(Optional.of(entity));
        when(entity.getId()).thenReturn(2L);
        when(mapper.toDto(entity)).thenReturn(response);
        when(assetService.getAllDocuments(2L)).thenReturn(Set.of());
        assertSame(response, service.getMachine(2L));
        verify(response).setDocumentResponseDtoSet(Set.of());
    }

    @Test
    void shouldGetAllMachines() {
        List<Machine> entities = List.of(mock(Machine.class));
        List<MachineResponseDto> expected = List.of(mock(MachineResponseDto.class));
        when(repository.findAll()).thenReturn(entities);
        when(mapper.toDtos(entities)).thenReturn(expected);
        assertEquals(expected, service.getAllMachine());
    }
}
