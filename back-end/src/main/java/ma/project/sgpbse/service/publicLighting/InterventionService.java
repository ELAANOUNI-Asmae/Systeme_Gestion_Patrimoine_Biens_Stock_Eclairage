package ma.project.sgpbse.service.publicLighting;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import ma.project.sgpbse.dto.asset.request.DocumentRequestDto;
import ma.project.sgpbse.dto.publicLighting.request.InterventionCompletionRequestDto;
import ma.project.sgpbse.dto.publicLighting.request.InterventionRequestDto;
import ma.project.sgpbse.dto.publicLighting.response.InterventionResponseDto;
import ma.project.sgpbse.dto.publicLighting.response.LightingDocumentResponseDto;
import ma.project.sgpbse.dto.publicLighting.response.TechnicianResponseDto;
import ma.project.sgpbse.entity.asset.Document;
import ma.project.sgpbse.entity.publicLighting.Failure;
import ma.project.sgpbse.entity.publicLighting.Intervention;
import ma.project.sgpbse.entity.user.User;
import ma.project.sgpbse.enums.FailureStatus;
import ma.project.sgpbse.enums.InterventionStatus;
import ma.project.sgpbse.enums.LightPointStatus;
import ma.project.sgpbse.repository.publicLighting.InterventionRepository;
import ma.project.sgpbse.service.NotificationService;
import ma.project.sgpbse.service.asset.DocumentService;
import ma.project.sgpbse.service.user.CurrentUserService;
import ma.project.sgpbse.service.user.UserService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Stream;

@AllArgsConstructor
@Service
public class InterventionService {
    private final InterventionRepository interventionRepository;
    private final FailureService failureService;
    private final LightPointService lightPointService;
    private final UserService userService;
    private final DocumentService<?> documentService;
    private final NotificationService notificationService;
    private final CurrentUserService currentUserService;

    @Transactional
    public InterventionResponseDto scheduleIntervention(Long failureId, InterventionRequestDto dto){
        Failure failure = failureService.getFailureById(failureId);
        if (failure.getFailureStatus() != FailureStatus.UNRESOLVED) throw new IllegalStateException("FAILURE_RESOLVED");
        if (failure.getIntervention() != null && failure.getIntervention().getStatus() != InterventionStatus.COMPLETED) throw new IllegalStateException("INTERVENTION_EXISTS");
        if (dto == null || dto.getTechnician_id() == null || dto.getInterventionDate() == null || dto.getDescription() == null || dto.getDescription().isBlank()) throw new IllegalArgumentException("INVALID_INTERVENTION");
        User technician = userService.getUserById(dto.getTechnician_id());
        Intervention intervention = new Intervention();
        intervention.setInterventionDate(dto.getInterventionDate());
        intervention.setDescription(dto.getDescription().trim());
        intervention.setCost(0.0);
        intervention.setFailure(failure);
        // The current Web UI has no separate Start button: scheduling starts the workflow.
        intervention.setStatus(InterventionStatus.IN_PROGRESS);
        intervention.setTechnician(technician);
        interventionRepository.save(intervention);
        failureService.linkToIntervention(failure, intervention);
        lightPointService.setSystemStatus(failure.getLightPoint().getId(), LightPointStatus.MAINTENANCE);
        User sender = currentUserService.getCurrentUser();
        notificationService.sendDirectNotification(sender, technician, "Planification d'intervention",
            "Vous êtes assigné à la panne du point lumineux " + failure.getLightPoint().getDesignation_fr());
        // DueDate is reserved for official documents in this project.
        // Creating a DueDate without a Document violates due_dates.document_id NOT NULL.
        // The intervention date remains persisted directly on the intervention.
        return toDto(interventionRepository.save(intervention));
    }

    @Transactional
    public InterventionResponseDto startIntervention(Long id){
        Intervention intervention = getInterventionById(id);
        if (intervention.getStatus() == InterventionStatus.COMPLETED) throw new IllegalStateException("INTERVENTION_ALREADY_COMPLETED");
        intervention.setStatus(InterventionStatus.IN_PROGRESS);
        lightPointService.setSystemStatus(intervention.getFailure().getLightPoint().getId(), LightPointStatus.MAINTENANCE);
        interventionRepository.save(intervention);
        return toDto(intervention);
    }

    @Transactional
    public InterventionResponseDto completeIntervention(Long id, InterventionCompletionRequestDto dto){
        Intervention intervention = getInterventionById(id);
        if (intervention.getStatus() == InterventionStatus.COMPLETED) throw new IllegalStateException("INTERVENTION_ALREADY_COMPLETED");
        if (dto == null || dto.getReport() == null || dto.getReport().trim().isEmpty()) throw new IllegalArgumentException("REPORT_REQUIRED");
        if (dto.getCost() == null || dto.getCost() < 0) throw new IllegalArgumentException("INVALID_COST");
        intervention.setCost(dto.getCost());
        intervention.setReport(dto.getReport().trim());
        intervention.setCompletedAt(dto.getCompletedAt() == null ? LocalDateTime.now() : dto.getCompletedAt());
        intervention.setStatus(InterventionStatus.COMPLETED);
        interventionRepository.save(intervention);
        failureService.resolveFailure(intervention.getFailure().getId());
        List<User> receivers = userService.filterByPermissionName("GET_INTERVENTION_NOTIFICATION");
        User sender = currentUserService.getCurrentUser();
        String message = "L'intervention sur le point lumineux " + intervention.getFailure().getLightPoint().getDesignation_fr() + " est terminée.";
        for (User receiver : receivers) notificationService.sendDirectNotification(sender, receiver, "Intervention terminée", message);
        return toDto(intervention);
    }

    @Transactional public InterventionResponseDto getIntervention(Long id){ return toDto(getInterventionById(id)); }
    @Transactional public List<InterventionResponseDto> getAllInterventions(){ return interventionRepository.findAll().stream().map(this::toDto).toList(); }
    @Transactional public Intervention getInterventionById(Long id){ return interventionRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("INTERVENTION_NOT_FOUND")); }
    @Transactional public Long countAllInterventionsByStatus(InterventionStatus status){ return interventionRepository.countAllByStatus(status); }

    @Transactional
    public List<InterventionResponseDto> searchGlobally(String description, Long technicianId, Long lightPointId){
        String q = description == null ? "" : description.trim().toLowerCase(Locale.ROOT);
        return interventionRepository.findAll().stream()
            .filter(i -> q.isEmpty() || (i.getDescription() != null && i.getDescription().toLowerCase(Locale.ROOT).contains(q)))
            .filter(i -> technicianId == null || (i.getTechnician() != null && technicianId.equals(i.getTechnician().getId())))
            .filter(i -> lightPointId == null || (i.getFailure() != null && i.getFailure().getLightPoint() != null && lightPointId.equals(i.getFailure().getLightPoint().getId())))
            .map(this::toDto).toList();
    }

    @Transactional
    public List<TechnicianResponseDto> getTechnicians() {
        Map<Long, User> unique = new LinkedHashMap<>();
        Stream.concat(userService.filterByPermissionName("START_INTERVENTION").stream(),
                      userService.filterByPermissionName("COMPLETE_INTERVENTION").stream())
            .forEach(u -> unique.put(u.getId(), u));
        return unique.values().stream().filter(User::isEnabled).map(u -> new TechnicianResponseDto(
            u.getId(), fullName(u.getFirstname_fr(), u.getLastname_fr()),
            fullName(u.getFirstname_ar(), u.getLastname_ar()), u.getPhone(),
            u.getServiceName() == null ? "" : u.getServiceName(), null, null, true
        )).toList();
    }

    private String fullName(String first, String last) { return ((first == null ? "" : first) + " " + (last == null ? "" : last)).trim(); }

    @Transactional
    public LightingDocumentResponseDto joinDoc(Long interventionId, MultipartFile file, DocumentRequestDto dto) {
        Intervention intervention = getInterventionById(interventionId);
        Document document = documentService.createDocument(dto, file, "GET_INTERVENTION_NOTIFICATION");
        documentService.addIntervention(document, intervention);
        intervention.getDocumentSet().add(document);
        interventionRepository.save(intervention);
        return documentDto(document);
    }

    public InterventionResponseDto toDto(Intervention i) {
        InterventionResponseDto dto = new InterventionResponseDto();
        dto.setId(i.getId()); dto.setFailureId(i.getFailure() == null ? null : i.getFailure().getId());
        User t = i.getTechnician();
        if (t != null) {
            dto.setTechnicianId(t.getId()); dto.setTechnician_name(fullName(t.getFirstname_fr(), t.getLastname_fr()));
            dto.setTechnician_name_ar(fullName(t.getFirstname_ar(), t.getLastname_ar())); dto.setTechnicianLocalisation(t.getServiceName());
        }
        dto.setInterventionDate(i.getInterventionDate()); dto.setDescription(i.getDescription()); dto.setCost(i.getCost()); dto.setStatus(i.getStatus());
        dto.setCompletedAt(i.getCompletedAt()); dto.setReport(i.getReport());
        if (i.getDocumentSet() != null) dto.setDocuments(i.getDocumentSet().stream().map(this::documentDto).toList());
        return dto;
    }
    private LightingDocumentResponseDto documentDto(Document d){ return new LightingDocumentResponseDto(d.getId(), d.getTitle_fr(), d.getTitle_ar(), d.getDocumentType(), d.getType(), d.getPath()); }
}
