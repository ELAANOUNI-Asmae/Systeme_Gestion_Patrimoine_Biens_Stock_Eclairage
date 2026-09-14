package ma.project.sgpbse.service.publicLighting;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import ma.project.sgpbse.dto.asset.request.DocumentRequestDto;
import ma.project.sgpbse.dto.publicLighting.request.FailureRequestDto;
import ma.project.sgpbse.dto.publicLighting.response.FailureResponseDto;
import ma.project.sgpbse.dto.publicLighting.response.LightingDocumentResponseDto;
import ma.project.sgpbse.dto.publicLighting.response.PublicFailureSummaryDto;
import ma.project.sgpbse.entity.asset.Document;
import ma.project.sgpbse.entity.publicLighting.Failure;
import ma.project.sgpbse.entity.publicLighting.Intervention;
import ma.project.sgpbse.entity.publicLighting.LightPoint;
import ma.project.sgpbse.entity.user.User;
import ma.project.sgpbse.enums.FailureStatus;
import ma.project.sgpbse.enums.InterventionStatus;
import ma.project.sgpbse.enums.LightPointStatus;
import ma.project.sgpbse.repository.publicLighting.FailureRepository;
import ma.project.sgpbse.service.NotificationService;
import ma.project.sgpbse.service.asset.DocumentService;
import ma.project.sgpbse.service.user.CurrentUserService;
import ma.project.sgpbse.service.user.UserService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@AllArgsConstructor
@Service
public class FailureService {
    private final FailureRepository failureRepository;
    private final LightPointService lightPointService;
    private final UserService userService;
    private final NotificationService notificationService;
    private final CurrentUserService currentUserService;
    private final DocumentService<?> documentService;

    @Transactional
    public FailureResponseDto reportFailure(FailureRequestDto dto) {
        LightPoint light;
        if (dto.getLightPointId() != null) light = lightPointService.getLightPointById(dto.getLightPointId());
        else if (dto.getLocation() != null && !dto.getLocation().isBlank()) light = lightPointService.getLightPointByLocation(dto.getLocation());
        else throw new IllegalArgumentException("LIGHT_POINT_REQUIRED");
        return createFailure(light, dto);
    }

    @Transactional
    public FailureResponseDto reportFailureByLightId(Long lightId, FailureRequestDto dto) {
        return createFailure(lightPointService.getLightPointById(lightId), dto);
    }

    private FailureResponseDto createFailure(LightPoint light, FailureRequestDto dto) {
        if (dto == null || dto.getDescription() == null || dto.getDescription().trim().isEmpty()) throw new IllegalArgumentException("DESCRIPTION_REQUIRED");
        if (failureRepository.existsByLightPoint_IdAndFailureStatus(light.getId(), FailureStatus.UNRESOLVED)) throw new IllegalStateException("FAILURE_EXISTS");
        Failure failure = new Failure();
        failure.setDescription(dto.getDescription().trim());
        failure.setReportedBy(dto.getReportedBy() == null || dto.getReportedBy().isBlank() ? "PUBLIC" : dto.getReportedBy().trim());
        failure.setReportDate(LocalDateTime.now());
        failure.setFailureStatus(FailureStatus.UNRESOLVED);
        failure.setLightPoint(light);
        failureRepository.save(failure);
        lightPointService.addFailure(light, failure);
        lightPointService.setSystemStatus(light.getId(), LightPointStatus.FAULTY);
        sendFailureNotification(light, "Déclaration d'une panne d'un point lumineux", "Le point lumineux " + light.getDesignation_fr() + " est en panne !");
        return toDto(failure);
    }

    private void sendFailureNotification(LightPoint light, String title, String message) {
        List<User> receivers = userService.filterByPermissionName("GET_FAILURE_NOTIFICATION");
        User sender = null;
        try { sender = currentUserService.getCurrentUser(); } catch (Exception ignored) { }
        for (User receiver : receivers) {
            // Un signalement public n'a pas d'utilisateur connecté. Dans ce cas on utilise
            // le destinataire comme expéditeur technique afin de conserver la notification.
            notificationService.sendDirectNotification(sender != null ? sender : receiver, receiver, title, message);
        }
    }

    @Transactional
    public FailureResponseDto resolveFailure(Long id) {
        Failure failure = getFailureById(id);
        failure.setFailureStatus(FailureStatus.RESOLVED);
        failureRepository.save(failure);
        lightPointService.setSystemStatus(failure.getLightPoint().getId(), LightPointStatus.OPERATIONAL);
        sendFailureNotification(failure.getLightPoint(), "Réglage de panne", "La panne du point lumineux " + failure.getLightPoint().getDesignation_fr() + " est réglée !");
        return toDto(failure);
    }

    @Transactional public FailureResponseDto getFailure(Long id){ return toDto(getFailureById(id)); }
    @Transactional public List<FailureResponseDto> getAllFailures(){ return failureRepository.findAll().stream().map(this::toDto).toList(); }
    @Transactional public List<PublicFailureSummaryDto> getPublicOpenFailures(){
        return failureRepository.findAllByFailureStatusOrderByReportDateDesc(FailureStatus.UNRESOLVED).stream()
            .map(f -> new PublicFailureSummaryDto(f.getId(), f.getLightPoint().getId(), workflowStatus(f))).toList();
    }
    @Transactional public Failure getFailureById(Long id){ return failureRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("No such failure with id: " + id)); }
    @Transactional public void linkToIntervention(Failure failure, Intervention intervention){ failure.setIntervention(intervention); failureRepository.save(failure); }
    @Transactional public Long countAllFailures(){ return failureRepository.count(); }

    @Transactional
    public LightingDocumentResponseDto joinDoc(Long failureId, MultipartFile file, DocumentRequestDto dto) {
        Failure failure = getFailureById(failureId);
        Document document = documentService.createDocument(dto, file, "GET_FAILURE_NOTIFICATION");
        documentService.addFailure(document, failure);
        failure.getDocumentSet().add(document);
        failureRepository.save(failure);
        return documentDto(document);
    }

    private String workflowStatus(Failure f) {
        if (f.getFailureStatus() == FailureStatus.RESOLVED) return "RESOLVED";
        Intervention intervention = f.getIntervention();
        return intervention != null && intervention.getStatus() != InterventionStatus.COMPLETED ? "IN_PROGRESS" : "REPORTED";
    }

    public FailureResponseDto toDto(Failure failure) {
        FailureResponseDto dto = new FailureResponseDto();
        LightPoint light = failure.getLightPoint();
        dto.setId(failure.getId()); dto.setLightPointId(light.getId());
        dto.setLightReference(light.getReference() == null || light.getReference().isBlank() ? String.format("LMP-%03d", light.getId()) : light.getReference());
        dto.setLightDesignation_fr(light.getDesignation_fr()); dto.setLightDesignation_ar(light.getDesignation_ar());
        dto.setReportDate(failure.getReportDate()); dto.setDescription(failure.getDescription()); dto.setLocation(light.getLocation());
        dto.setReportedBy(failure.getReportedBy() == null ? "PUBLIC" : failure.getReportedBy());
        dto.setFailureStatus(failure.getFailureStatus()); dto.setWorkflowStatus(workflowStatus(failure));
        if (failure.getDocumentSet() != null) dto.setDocuments(failure.getDocumentSet().stream().map(this::documentDto).toList());
        return dto;
    }
    private LightingDocumentResponseDto documentDto(Document d){ return new LightingDocumentResponseDto(d.getId(), d.getTitle_fr(), d.getTitle_ar(), d.getDocumentType(), d.getType(), d.getPath()); }
}
