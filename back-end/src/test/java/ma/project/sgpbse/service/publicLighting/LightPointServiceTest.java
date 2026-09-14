package ma.project.sgpbse.service.publicLighting;

import ma.project.sgpbse.dto.publicLighting.request.LightPointRequestDto;
import ma.project.sgpbse.entity.publicLighting.LightPoint;
import ma.project.sgpbse.enums.LightPointStatus;
import ma.project.sgpbse.repository.publicLighting.LightPointRepository;
import ma.project.sgpbse.service.asset.DocumentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LightPointServiceTest {

    @Mock private LightPointRepository repository;
    @Mock private DocumentService<?> documentService;

    private LightPointService service;

    @BeforeEach
    void setUp() {
        service = new LightPointService(repository, documentService);
    }

    @Test
    void shouldRejectInvalidLightPoint() {
        LightPointRequestDto dto = new LightPointRequestDto();
        assertThrows(IllegalArgumentException.class, () -> service.createLightPoint(dto));
        verifyNoInteractions(repository);
    }

    @Test
    void shouldRejectDuplicateReference() {
        LightPointRequestDto dto = validDto();
        when(repository.findByReferenceIgnoreCase("LMP-001")).thenReturn(Optional.of(new LightPoint()));

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> service.createLightPoint(dto));
        assertEquals("LIGHT_REFERENCE_ALREADY_EXISTS", ex.getMessage());
    }

    @Test
    void shouldCreateOperationalLightPointAndNormalizeReference() {
        LightPointRequestDto dto = validDto();
        when(repository.findByReferenceIgnoreCase("LMP-001")).thenReturn(Optional.empty());
        when(repository.save(any(LightPoint.class))).thenAnswer(invocation -> {
            LightPoint light = invocation.getArgument(0);
            light.setId(15L);
            return light;
        });

        assertEquals(15L, service.createLightPoint(dto));

        ArgumentCaptor<LightPoint> captor = ArgumentCaptor.forClass(LightPoint.class);
        verify(repository).save(captor.capture());
        assertEquals("LMP-001", captor.getValue().getReference());
        assertEquals(LightPointStatus.OPERATIONAL, captor.getValue().getLightPointStatus());
        assertEquals("Rue Hassan II", captor.getValue().getLocation());
    }

    @Test
    void shouldUpdateLightPointStatus() {
        LightPoint light = new LightPoint();
        light.setId(2L);
        light.setLightPointStatus(LightPointStatus.OPERATIONAL);
        when(repository.findById(2L)).thenReturn(Optional.of(light));

        assertEquals(2L, service.updateLightPointStatus(2L, LightPointStatus.MAINTENANCE));
        assertEquals(LightPointStatus.MAINTENANCE, light.getLightPointStatus());
        verify(repository).save(light);
    }

    @Test
    void shouldCountLightPoints() {
        when(repository.count()).thenReturn(25L);
        when(repository.countByLightPointStatus(LightPointStatus.FAULTY)).thenReturn(3L);

        assertEquals(25L, service.countAllLightPoints());
        assertEquals(3L, service.countAllLightPointsByStatus(LightPointStatus.FAULTY));
    }

    private LightPointRequestDto validDto() {
        LightPointRequestDto dto = new LightPointRequestDto();
        dto.setReference(" lmp-001 ");
        dto.setDesignation_fr("Lampadaire A");
        dto.setDesignation_ar("مصباح أ");
        dto.setLocation("Rue Hassan II");
        dto.setPower(120.0);
        dto.setLatitude(30.4200);
        dto.setLongitude(-9.6000);
        dto.setInstallationDate(LocalDate.of(2026, 1, 10));
        return dto;
    }
}
