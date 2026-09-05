package ma.project.sgpbse.controller.publicLighting;

import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import ma.project.sgpbse.dto.asset.request.DocumentRequestDto;
import ma.project.sgpbse.dto.publicLighting.request.InterventionRequestDto;
import ma.project.sgpbse.dto.publicLighting.response.InterventionResponseDto;
import ma.project.sgpbse.entity.publicLighting.Intervention;
import ma.project.sgpbse.entity.user.User;
import ma.project.sgpbse.enums.InterventionStatus;
import ma.project.sgpbse.service.publicLighting.InterventionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@AllArgsConstructor

@RestController
@RequestMapping("/sgpbse/intervention")
public class InterventionController {

    @Autowired
    private final InterventionService interventionService;

    //planifier une intervention
    @PostMapping("/schedule/{failure_id}")
    @PreAuthorize("hasAuthority('SCHEDULE_INTERVENTION')")
    public ResponseEntity<InterventionResponseDto> scheduleIntervention(@PathVariable Long failure_id, @RequestBody @Valid InterventionRequestDto interventionRequestDto){
        return ResponseEntity.ok(interventionService.scheduleIntervention(failure_id, interventionRequestDto));
    }

    //démarrer une intervention
    @PostMapping("/start/{intervention_id}")
    @PreAuthorize("hasAuthority('START_INTERVENTION')")
    public ResponseEntity<InterventionResponseDto> startIntervention(@PathVariable Long intervention_id){
        return ResponseEntity.ok(interventionService.startIntervention(intervention_id));
    }

    //finir une intervention
    @PostMapping("/complete/{intervention_id}")
    @PreAuthorize("hasAuthority('COMPLETE_INTERVENTION')")
    private ResponseEntity<Long> completeIntervention(@PathVariable Long intervention_id,
                                                      @RequestPart("cost") Double cost,
                                                      @RequestPart("docs") @Valid Set<DocumentRequestDto> documentRequestDtos){
        return ResponseEntity.ok(interventionService.completeIntervention(intervention_id,
                cost,
                documentRequestDtos));
    }

    //get
    @GetMapping("/{intervention_id}")
    @PreAuthorize("hasAuthority('GET_INTERVENTION')")
    public ResponseEntity<InterventionResponseDto> getIntervention(@PathVariable Long intervention_id){
        return ResponseEntity.ok(interventionService.getIntervention(intervention_id));
    }

    //getALL
    @PostMapping("/{intervention_id}")
    @PreAuthorize("hasAuthority('GET_INTERVENTION')")
    public ResponseEntity<List<InterventionResponseDto>> getAllInterventions(){
        return ResponseEntity.ok(interventionService.getAllInterventions());
    }

    //count interventions by status
    @GetMapping("/count_by_status")
    @PreAuthorize("hasAuthority('COUNT_INTERVENTIONS_BY_STATUS')")
    public ResponseEntity<Long> countAllInterventionsByStatus(@RequestPart(name = "status") InterventionStatus interventionStatus){
        return ResponseEntity.ok(interventionService.countAllInterventionsByStatus(interventionStatus));
    }

    //search intervention by description, technician or lightpoint
    @GetMapping("/search")
    @PreAuthorize("hasAuthority('SEARCH_INTERVENTIONS')")
    public List<Intervention> searchGlobally(@RequestPart(name = "description") String description,
                                             @RequestPart(name = "technician_id")Long technicianId,
                                             @RequestPart(name = "lightPoint_id") Long lightPointId){

        return interventionService.searchGlobally(description, technicianId, lightPointId);

    }
}
