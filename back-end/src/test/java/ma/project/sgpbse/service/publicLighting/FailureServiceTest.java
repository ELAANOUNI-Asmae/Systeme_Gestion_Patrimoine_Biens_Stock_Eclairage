package ma.project.sgpbse.service.publicLighting;

import ma.project.sgpbse.dto.publicLighting.request.FailureRequestDto;
import ma.project.sgpbse.dto.publicLighting.response.FailureResponseDto;
import ma.project.sgpbse.entity.publicLighting.Failure;
import ma.project.sgpbse.entity.publicLighting.LightPoint;
import ma.project.sgpbse.enums.FailureStatus;
import ma.project.sgpbse.enums.LightPointStatus;
import ma.project.sgpbse.repository.publicLighting.FailureRepository;
import ma.project.sgpbse.service.NotificationService;
import ma.project.sgpbse.service.asset.DocumentService;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FailureServiceTest {

    @Mock private FailureRepository repository;
    @Mock private LightPointService lightPointService;
    @Mock private UserService userService;
    @Mock private NotificationService notificationService;
    @Mock private CurrentUserService currentUserService;
    @Mock private DocumentService<?> documentService;

    private FailureService service;

    @BeforeEach
    void setUp() {
        service = new FailureService(
                repository,
                lightPointService,
                userService,
                notificationService,
                currentUserService,
                documentService
        );
        lenient().when(repository.save(any(Failure.class))).thenAnswer(i -> i.getArgument(0));
        lenient().when(userService.filterByPermissionName("GET_FAILURE_NOTIFICATION")).thenReturn(List.of());
    }

    @Test
    void shouldRequireLightPointForFailureDeclaration() {
        FailureRequestDto dto = new FailureRequestDto();
        dto.setDescription("Lampadaire éteint");

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> service.reportFailure(dto));
        assertEquals("LIGHT_POINT_REQUIRED", ex.getMessage());
    }

    @Test
    void shouldRequireDescription() {
        LightPoint light = light();
        FailureRequestDto dto = new FailureRequestDto();
        dto.setLightPointId(1L);
        dto.setDescription("   ");
        when(lightPointService.getLightPointById(1L)).thenReturn(light);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> service.reportFailure(dto));
        assertEquals("DESCRIPTION_REQUIRED", ex.getMessage());
    }

    @Test
    void shouldRejectSecondUnresolvedFailureForSameLight() {
        LightPoint light = light();
        FailureRequestDto dto = new FailureRequestDto();
        dto.setLightPointId(1L);
        dto.setDescription("Clignote");
        when(lightPointService.getLightPointById(1L)).thenReturn(light);
        when(repository.existsByLightPoint_IdAndFailureStatus(1L, FailureStatus.UNRESOLVED)).thenReturn(true);

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> service.reportFailure(dto));
        assertEquals("FAILURE_EXISTS", ex.getMessage());
    }

    @Test
    void shouldCreatePublicFailureAndMarkLightFaulty() {
        LightPoint light = light();
        FailureRequestDto dto = new FailureRequestDto();
        dto.setLightPointId(1L);
        dto.setDescription("  Ne s'allume plus  ");
        when(lightPointService.getLightPointById(1L)).thenReturn(light);
        when(repository.existsByLightPoint_IdAndFailureStatus(1L, FailureStatus.UNRESOLVED)).thenReturn(false);

        FailureResponseDto result = service.reportFailure(dto);

        assertEquals(FailureStatus.UNRESOLVED, result.getFailureStatus());
        assertEquals("Ne s'allume plus", result.getDescription());
        assertEquals("PUBLIC", result.getReportedBy());
        verify(lightPointService).addFailure(eq(light), any(Failure.class));
        verify(lightPointService).setSystemStatus(1L, LightPointStatus.FAULTY);
    }

    @Test
    void shouldResolveFailureAndRestoreLightOperationalStatus() {
        LightPoint light = light();
        Failure failure = new Failure();
        failure.setId(9L);
        failure.setLightPoint(light);
        failure.setFailureStatus(FailureStatus.UNRESOLVED);
        when(repository.findById(9L)).thenReturn(Optional.of(failure));

        FailureResponseDto result = service.resolveFailure(9L);

        assertEquals(FailureStatus.RESOLVED, result.getFailureStatus());
        verify(repository).save(failure);
        verify(lightPointService).setSystemStatus(1L, LightPointStatus.OPERATIONAL);
    }

    private LightPoint light() {
        LightPoint light = new LightPoint();
        light.setId(1L);
        light.setReference("LMP-001");
        light.setDesignation_fr("Lampadaire A");
        light.setDesignation_ar("مصباح أ");
        light.setLocation("Agadir");
        light.setLightPointStatus(LightPointStatus.OPERATIONAL);
        return light;
    }
}
