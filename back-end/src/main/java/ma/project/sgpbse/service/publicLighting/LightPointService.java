package ma.project.sgpbse.service.publicLighting;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import ma.project.sgpbse.dto.asset.request.DocumentRequestDto;
import ma.project.sgpbse.dto.publicLighting.request.LightPointRequestDto;
import ma.project.sgpbse.dto.publicLighting.response.LightPointResponseDto;
import ma.project.sgpbse.dto.publicLighting.response.LightingDocumentResponseDto;
import ma.project.sgpbse.entity.asset.Document;
import ma.project.sgpbse.entity.publicLighting.Failure;
import ma.project.sgpbse.entity.publicLighting.LightPoint;
import ma.project.sgpbse.enums.LightPointStatus;
import ma.project.sgpbse.exception.publicLighting.LightPointNotExistException;
import ma.project.sgpbse.repository.publicLighting.LightPointRepository;
import ma.project.sgpbse.service.asset.DocumentService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@AllArgsConstructor
@Service
public class LightPointService {
    private final LightPointRepository lightPointRepository;
    private final DocumentService<?> documentService;

    @Transactional
    public Long createLightPoint(LightPointRequestDto dto) {
        validate(dto);
        String reference = dto.getReference().trim().toUpperCase(Locale.ROOT);
        if (lightPointRepository.findByReferenceIgnoreCase(reference).isPresent()) {
            throw new IllegalStateException("LIGHT_REFERENCE_ALREADY_EXISTS");
        }
        LightPoint light = new LightPoint();
        apply(dto, light);
        light.setReference(reference);
        light.setLightPointStatus(LightPointStatus.OPERATIONAL);
        return lightPointRepository.save(light).getId();
    }

    @Transactional
    public LightPointResponseDto updateLightPoint(Long id, LightPointRequestDto dto) {
        validate(dto);
        LightPoint light = getLightPointById(id);
        String reference = dto.getReference().trim().toUpperCase(Locale.ROOT);
        lightPointRepository.findByReferenceIgnoreCase(reference).ifPresent(other -> {
            if (!other.getId().equals(id)) throw new IllegalStateException("LIGHT_REFERENCE_ALREADY_EXISTS");
        });
        apply(dto, light);
        light.setReference(reference);
        return toDto(lightPointRepository.save(light), false);
    }

    private void validate(LightPointRequestDto dto) {
        if (dto == null || dto.getReference() == null || dto.getReference().isBlank()
                || dto.getDesignation_fr() == null || dto.getDesignation_fr().isBlank()
                || dto.getDesignation_ar() == null || dto.getDesignation_ar().isBlank()
                || dto.getLocation() == null || dto.getLocation().isBlank()
                || dto.getInstallationDate() == null || dto.getPower() == null || dto.getPower() <= 0
                || dto.getLatitude() == null || dto.getLatitude() < -90 || dto.getLatitude() > 90
                || dto.getLongitude() == null || dto.getLongitude() < -180 || dto.getLongitude() > 180) {
            throw new IllegalArgumentException("INVALID_LIGHT_POINT");
        }
    }

    private void apply(LightPointRequestDto dto, LightPoint light) {
        light.setDesignation_fr(dto.getDesignation_fr().trim());
        light.setDesignation_ar(dto.getDesignation_ar().trim());
        light.setLocation(dto.getLocation().trim());
        light.setPower(dto.getPower());
        light.setLatitude(dto.getLatitude());
        light.setLongitude(dto.getLongitude());
        light.setInstallationDate(dto.getInstallationDate());
    }

    @Transactional
    public Long deleteLightPoint(Long id) {
        LightPoint light = getLightPointById(id);
        lightPointRepository.delete(light);
        return id;
    }

    @Transactional
    public Long updateLightPointStatus(Long id, LightPointStatus status) {
        LightPoint light = getLightPointById(id);
        light.setLightPointStatus(status);
        lightPointRepository.save(light);
        return id;
    }

    @Transactional
    public void setSystemStatus(Long id, LightPointStatus status) {
        LightPoint light = getLightPointById(id);
        light.setLightPointStatus(status);
        lightPointRepository.save(light);
    }

    @Transactional
    public LightPointResponseDto getLightPoint(Long id) { return toDto(getLightPointById(id), false); }

    @Transactional
    public List<LightPointResponseDto> getAllLightPoints() {
        return lightPointRepository.findAll().stream().map(x -> toDto(x, false)).toList();
    }

    @Transactional
    public List<LightPointResponseDto> getPublicLightPoints() {
        return lightPointRepository.findAll().stream().map(x -> toDto(x, true)).toList();
    }

    @Transactional
    public LightPoint getLightPointById(Long id) {
        return lightPointRepository.findById(id)
                .orElseThrow(() -> new LightPointNotExistException("Light point not found"));
    }

    @Transactional
    public LightPoint getLightPointByLocation(String location) {
        return lightPointRepository.findByLocation(location)
                .orElseThrow(() -> new LightPointNotExistException("Light point not found"));
    }

    @Transactional
    public void addFailure(LightPoint light, Failure failure) {
        if (light.getFailureList() != null && !light.getFailureList().contains(failure)) light.getFailureList().add(failure);
        lightPointRepository.save(light);
    }

    @Transactional public Long countAllLightPoints(){ return lightPointRepository.count(); }
    @Transactional public Long countAllLightPointsByStatus(LightPointStatus status){ return lightPointRepository.countByLightPointStatus(status); }

    @Transactional
    public List<LightPointResponseDto> filterByStatus(LightPointStatus status){
        return lightPointRepository.findAllByLightPointStatus(status).stream().map(x -> toDto(x, false)).toList();
    }

    @Transactional
    public List<LightPointResponseDto> searchGlobally(String designationAr, String designationFr, String location){
        String ar = clean(designationAr); String fr = clean(designationFr); String loc = clean(location);
        return lightPointRepository.findAll().stream().filter(light ->
                (ar == null || contains(light.getDesignation_ar(), ar)) &&
                (fr == null || contains(light.getDesignation_fr(), fr)) &&
                (loc == null || contains(light.getLocation(), loc)))
            .sorted(Comparator.comparing(LightPoint::getId).reversed())
            .map(x -> toDto(x, false)).toList();
    }

    private String clean(String s){ return s == null || s.trim().isEmpty() ? null : s.trim().toLowerCase(Locale.ROOT); }
    private boolean contains(String value, String query){ return value != null && value.toLowerCase(Locale.ROOT).contains(query); }

    @Transactional
    public LightingDocumentResponseDto joinDoc(Long lightId, MultipartFile file, DocumentRequestDto dto) {
        LightPoint light = getLightPointById(lightId);
        Document document = documentService.createDocument(dto, file, "GET_FAILURE_NOTIFICATION");
        documentService.addLightPoint(document, light);
        light.getDocumentSet().add(document);
        lightPointRepository.save(light);
        return documentDto(document);
    }

    @Transactional
    public void deleteDocument(Long lightId, Long documentId) {
        LightPoint light = getLightPointById(lightId);
        boolean belongs = light.getDocumentSet().stream().anyMatch(d -> d.getId().equals(documentId));
        if (!belongs) throw new IllegalArgumentException("DOCUMENT_NOT_LINKED_TO_LIGHT");
        documentService.deleteDocument(documentId);
    }

    public LightPointResponseDto toDto(LightPoint light, boolean publicView) {
        LightPointResponseDto dto = new LightPointResponseDto();
        dto.setId(light.getId());
        dto.setReference(light.getReference() == null || light.getReference().isBlank() ? String.format("LMP-%03d", light.getId()) : light.getReference());
        dto.setDesignation_fr(light.getDesignation_fr()); dto.setDesignation_ar(light.getDesignation_ar());
        dto.setLocation(light.getLocation()); dto.setPower(light.getPower()); dto.setLatitude(light.getLatitude()); dto.setLongitude(light.getLongitude());
        dto.setInstallationDate(light.getInstallationDate()); dto.setLightPointStatus(light.getLightPointStatus());
        if (!publicView && light.getDocumentSet() != null) dto.setDocuments(light.getDocumentSet().stream().map(this::documentDto).toList());
        return dto;
    }

    private LightingDocumentResponseDto documentDto(Document d) {
        return new LightingDocumentResponseDto(d.getId(), d.getTitle_fr(), d.getTitle_ar(), d.getDocumentType(), d.getType(), d.getPath());
    }
}
