package ma.project.sgpbse.service.asset;

import ma.project.sgpbse.dto.asset.request.RealEstateRequestDto;
import ma.project.sgpbse.dto.asset.response.RealEstateResponseDto;
import ma.project.sgpbse.entity.asset.RealEstate;
import ma.project.sgpbse.enums.AssetStatus;
import ma.project.sgpbse.exception.asset.RealEstateNotExistException;
import ma.project.sgpbse.mapper.asset.RealEstateMapper;
import ma.project.sgpbse.repository.asset.RealEstateRepository;
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
class RealEstateServiceTest {

    @Mock private RealEstateRepository repository;
    @Mock private RealEstateMapper mapper;
    @Mock private AssetService assetService;
    private RealEstateService service;

    @BeforeEach
    void setUp() {
        service = new RealEstateService(repository, mapper, assetService);
    }

    @Test
    void shouldCreateAvailableRealEstateWhenAssignmentBlank() {
        RealEstateRequestDto dto = mock(RealEstateRequestDto.class);
        RealEstate entity = mock(RealEstate.class);
        RealEstateResponseDto response = mock(RealEstateResponseDto.class);
        when(dto.getAssignment()).thenReturn("   ");
        when(mapper.toEntity(dto)).thenReturn(entity);
        when(mapper.toDto(entity)).thenReturn(response);

        assertSame(response, service.createRealEstate(dto));
        verify(entity).setAssetStatus(AssetStatus.AVAILABLE);
        verify(repository).save(entity);
    }

    @Test
    void shouldCreateInUseRealEstateWhenAssigned() {
        RealEstateRequestDto dto = mock(RealEstateRequestDto.class);
        RealEstate entity = mock(RealEstate.class);
        when(dto.getAssignment()).thenReturn("Service Technique");
        when(mapper.toEntity(dto)).thenReturn(entity);
        when(mapper.toDto(entity)).thenReturn(mock(RealEstateResponseDto.class));

        service.createRealEstate(dto);
        verify(entity).setAssetStatus(AssetStatus.IN_USE);
    }

    @Test
    void shouldUpdateExistingRealEstate() {
        RealEstateRequestDto dto = mock(RealEstateRequestDto.class);
        RealEstate entity = mock(RealEstate.class);
        when(repository.findById(7L)).thenReturn(Optional.of(entity));
        when(entity.getId()).thenReturn(7L);

        assertEquals(7L, service.updateRealEstate(7L, dto));
        verify(mapper).updateEntityFromDto(dto, entity);
        verify(repository).save(entity);
    }

    @Test
    void shouldRejectUnknownRealEstateOnUpdate() {
        when(repository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(RealEstateNotExistException.class,
                () -> service.updateRealEstate(99L, mock(RealEstateRequestDto.class)));
    }

    @Test
    void shouldDeleteExistingRealEstate() {
        when(repository.findById(4L)).thenReturn(Optional.of(mock(RealEstate.class)));
        assertEquals("Successfully deleted !", service.deleteRealEstate(4L));
        verify(repository).deleteById(4L);
    }

    @Test
    void shouldGetRealEstateWithDocuments() {
        RealEstate entity = mock(RealEstate.class);
        RealEstateResponseDto response = mock(RealEstateResponseDto.class);
        when(repository.findById(2L)).thenReturn(Optional.of(entity));
        when(entity.getId()).thenReturn(2L);
        when(mapper.toDto(entity)).thenReturn(response);
        when(assetService.getAllDocuments(2L)).thenReturn(Set.of());

        assertSame(response, service.getRealEstate(2L));
        verify(response).setDocumentResponseDtoSet(Set.of());
    }

    @Test
    void shouldGetAllRealEstates() {
        List<RealEstate> entities = List.of(mock(RealEstate.class));
        List<RealEstateResponseDto> expected = List.of(mock(RealEstateResponseDto.class));
        when(repository.findAll()).thenReturn(entities);
        when(mapper.toDtos(entities)).thenReturn(expected);
        assertEquals(expected, service.getAllRealEstates());
    }
}
