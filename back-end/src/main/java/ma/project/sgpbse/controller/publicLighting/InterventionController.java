package ma.project.sgpbse.controller.publicLighting;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import ma.project.sgpbse.dto.asset.request.DocumentRequestDto;
import ma.project.sgpbse.dto.publicLighting.request.InterventionCompletionRequestDto;
import ma.project.sgpbse.dto.publicLighting.request.InterventionRequestDto;
import ma.project.sgpbse.dto.publicLighting.response.InterventionResponseDto;
import ma.project.sgpbse.dto.publicLighting.response.LightingDocumentResponseDto;
import ma.project.sgpbse.dto.publicLighting.response.TechnicianResponseDto;
import ma.project.sgpbse.enums.InterventionStatus;
import ma.project.sgpbse.service.publicLighting.InterventionService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@AllArgsConstructor
@RestController
@RequestMapping("/sgpbse/intervention")
public class InterventionController {
    private final InterventionService interventionService;

    @PostMapping("/schedule/{failureId}") @PreAuthorize("hasAuthority('SCHEDULE_INTERVENTION')")
    public ResponseEntity<InterventionResponseDto> schedule(@PathVariable Long failureId, @RequestBody @Valid InterventionRequestDto dto){ return ResponseEntity.ok(interventionService.scheduleIntervention(failureId, dto)); }

    @PostMapping("/start/{id}") @PreAuthorize("hasAuthority('START_INTERVENTION')")
    public ResponseEntity<InterventionResponseDto> start(@PathVariable Long id){ return ResponseEntity.ok(interventionService.startIntervention(id)); }

    @PostMapping("/complete/{id}") @PreAuthorize("hasAuthority('COMPLETE_INTERVENTION')")
    public ResponseEntity<InterventionResponseDto> complete(@PathVariable Long id, @RequestBody @Valid InterventionCompletionRequestDto dto){ return ResponseEntity.ok(interventionService.completeIntervention(id, dto)); }

    @GetMapping("/{id}") @PreAuthorize("hasAuthority('GET_INTERVENTION')")
    public ResponseEntity<InterventionResponseDto> get(@PathVariable Long id){ return ResponseEntity.ok(interventionService.getIntervention(id)); }

    @GetMapping("/all") @PreAuthorize("hasAuthority('GET_INTERVENTION')")
    public ResponseEntity<List<InterventionResponseDto>> all(){ return ResponseEntity.ok(interventionService.getAllInterventions()); }

    @GetMapping("/technicians") @PreAuthorize("hasAuthority('SCHEDULE_INTERVENTION')")
    public ResponseEntity<List<TechnicianResponseDto>> technicians(){ return ResponseEntity.ok(interventionService.getTechnicians()); }

    @GetMapping("/count_by_status") @PreAuthorize("hasAuthority('COUNT_INTERVENTIONS_BY_STATUS')")
    public ResponseEntity<Long> count(@RequestParam("status") InterventionStatus status){ return ResponseEntity.ok(interventionService.countAllInterventionsByStatus(status)); }

    @GetMapping("/search") @PreAuthorize("hasAuthority('SEARCH_INTERVENTIONS')")
    public ResponseEntity<List<InterventionResponseDto>> search(@RequestParam(required=false) String description, @RequestParam(required=false,name="technician_id") Long technicianId, @RequestParam(required=false,name="lightPoint_id") Long lightPointId){
        return ResponseEntity.ok(interventionService.searchGlobally(description, technicianId, lightPointId));
    }

    @PostMapping(value="/joinDoc/{id}", consumes=MediaType.MULTIPART_FORM_DATA_VALUE) @PreAuthorize("hasAnyAuthority('SCHEDULE_INTERVENTION','COMPLETE_INTERVENTION','UPDATE_INTERVENTION')")
    public ResponseEntity<LightingDocumentResponseDto> joinDoc(@PathVariable Long id, @RequestPart("file") MultipartFile file, @RequestPart("data") @Valid DocumentRequestDto dto){ return ResponseEntity.ok(interventionService.joinDoc(id, file, dto)); }
}
