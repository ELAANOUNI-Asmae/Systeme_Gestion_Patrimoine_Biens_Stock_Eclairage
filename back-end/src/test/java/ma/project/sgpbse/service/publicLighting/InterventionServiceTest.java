package ma.project.sgpbse.service.publicLighting;

import ma.project.sgpbse.dto.publicLighting.request.InterventionCompletionRequestDto;
import ma.project.sgpbse.dto.publicLighting.request.InterventionRequestDto;
import ma.project.sgpbse.entity.publicLighting.Failure;
import ma.project.sgpbse.entity.publicLighting.Intervention;
import ma.project.sgpbse.enums.FailureStatus;
import ma.project.sgpbse.enums.InterventionStatus;
import ma.project.sgpbse.repository.publicLighting.InterventionRepository;
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
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InterventionServiceTest {

    @Mock private InterventionRepository repository;
    @Mock private FailureService failureService;
    @Mock private LightPointService lightPointService;
    @Mock private UserService userService;
    @Mock private DocumentService<?> documentService;
    @Mock private NotificationService notificationService;
    @Mock private CurrentUserService currentUserService;

    private InterventionService service;

    @BeforeEach
    void setUp() {
        service = new InterventionService(repository, failureService, lightPointService,
                userService, documentService, notificationService, currentUserService);
    }

    @Test
    void shouldRejectSchedulingResolvedFailure() {
        Failure failure = mock(Failure.class);
        when(failureService.getFailureById(1L)).thenReturn(failure);
        when(failure.getFailureStatus()).thenReturn(FailureStatus.RESOLVED);

        IllegalStateException ex = assertThrows(IllegalStateException.class,
                () -> service.scheduleIntervention(1L, mock(InterventionRequestDto.class)));
        assertEquals("FAILURE_RESOLVED", ex.getMessage());
    }

    @Test
    void shouldRejectSchedulingWhenInterventionAlreadyExists() {
        Failure failure = mock(Failure.class);
        Intervention existing = mock(Intervention.class);
        when(failureService.getFailureById(1L)).thenReturn(failure);
        when(failure.getFailureStatus()).thenReturn(FailureStatus.UNRESOLVED);
        when(failure.getIntervention()).thenReturn(existing);
        when(existing.getStatus()).thenReturn(InterventionStatus.IN_PROGRESS);

        IllegalStateException ex = assertThrows(IllegalStateException.class,
                () -> service.scheduleIntervention(1L, mock(InterventionRequestDto.class)));
        assertEquals("INTERVENTION_EXISTS", ex.getMessage());
    }

    @Test
    void shouldRejectInvalidInterventionRequest() {
        Failure failure = mock(Failure.class);
        when(failureService.getFailureById(1L)).thenReturn(failure);
        when(failure.getFailureStatus()).thenReturn(FailureStatus.UNRESOLVED);
        when(failure.getIntervention()).thenReturn(null);

        assertThrows(IllegalArgumentException.class,
                () -> service.scheduleIntervention(1L, null));
    }

    @Test
    void shouldRejectStartingCompletedIntervention() {
        Intervention intervention = mock(Intervention.class);
        when(repository.findById(2L)).thenReturn(Optional.of(intervention));
        when(intervention.getStatus()).thenReturn(InterventionStatus.COMPLETED);

        IllegalStateException ex = assertThrows(IllegalStateException.class,
                () -> service.startIntervention(2L));
        assertEquals("INTERVENTION_ALREADY_COMPLETED", ex.getMessage());
    }

    @Test
    void shouldRequireReportWhenCompletingIntervention() {
        Intervention intervention = mock(Intervention.class);
        InterventionCompletionRequestDto dto = mock(InterventionCompletionRequestDto.class);
        when(repository.findById(2L)).thenReturn(Optional.of(intervention));
        when(intervention.getStatus()).thenReturn(InterventionStatus.IN_PROGRESS);
        when(dto.getReport()).thenReturn("   ");

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> service.completeIntervention(2L, dto));
        assertEquals("REPORT_REQUIRED", ex.getMessage());
    }

    @Test
    void shouldRejectNegativeInterventionCost() {
        Intervention intervention = mock(Intervention.class);
        InterventionCompletionRequestDto dto = mock(InterventionCompletionRequestDto.class);
        when(repository.findById(2L)).thenReturn(Optional.of(intervention));
        when(intervention.getStatus()).thenReturn(InterventionStatus.IN_PROGRESS);
        when(dto.getReport()).thenReturn("Intervention terminée");
        when(dto.getCost()).thenReturn(-1.0);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> service.completeIntervention(2L, dto));
        assertEquals("INVALID_COST", ex.getMessage());
    }

    @Test
    void shouldRejectUnknownIntervention() {
        when(repository.findById(404L)).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class, () -> service.getInterventionById(404L));
    }

    @Test
    void shouldCountInterventionsByStatus() {
        when(repository.countAllByStatus(InterventionStatus.IN_PROGRESS)).thenReturn(3L);
        assertEquals(3L, service.countAllInterventionsByStatus(InterventionStatus.IN_PROGRESS));
    }

    @Test
    void shouldReturnEmptyInterventionList() {
        when(repository.findAll()).thenReturn(List.of());
        assertTrue(service.getAllInterventions().isEmpty());
    }

    @Test
    void shouldReturnEmptyTechnicianListWhenNoAuthorizedUsers() {
        when(userService.filterByPermissionName("START_INTERVENTION")).thenReturn(List.of());
        when(userService.filterByPermissionName("COMPLETE_INTERVENTION")).thenReturn(List.of());
        assertTrue(service.getTechnicians().isEmpty());
    }
}
