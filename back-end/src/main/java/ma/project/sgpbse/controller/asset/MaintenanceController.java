package ma.project.sgpbse.controller.asset;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import ma.project.sgpbse.dto.asset.request.DocumentRequestDto;
import ma.project.sgpbse.dto.asset.request.MaintenanceRequestDto;
import ma.project.sgpbse.dto.asset.response.MaintenanceResponseDto;
import ma.project.sgpbse.service.asset.MaintenanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@AllArgsConstructor

@RestController
@RequestMapping("/sgpbse/maintenance")
public class MaintenanceController {

    @Autowired
    private final MaintenanceService maintenanceService;

    //1.planifier
    @PostMapping("/schedule/{asset_id}")
    @PreAuthorize("hasAuthority('SCHEDULE_MAINTENANCE')")
    public ResponseEntity<Long> scheduleMaintenance(@PathVariable Long asset_id, @RequestBody @Valid MaintenanceRequestDto maintenanceRequestDto){
        return ResponseEntity.ok(
                maintenanceService.scheduleMaintenance(asset_id, maintenanceRequestDto)
        );
    }

    //2.commencer
    @PostMapping("/start/{maintenance_id}")
    @PreAuthorize("hasAuthority('START_MAINTENANCE')")
    public ResponseEntity<String> startMaintenance(@PathVariable Long maintenance_id){
        return ResponseEntity.ok(maintenanceService.startMaintenance(maintenance_id));
    }

    //3.finir
    @PostMapping("/complete/{asset_id}")
    @PreAuthorize("hasAuthority('COMPLETE_MAINTENANCE')")
    public ResponseEntity<MaintenanceResponseDto> completeMaintenance(@PathVariable Long maintenance_id, @RequestBody Double cost){
        return ResponseEntity.ok(maintenanceService.completeMaintenance(maintenance_id, cost));
    }

    //update
    @PutMapping("/update/{maintenance_id}")
    @PreAuthorize("hasAuthority('UPDATE_MAINTENANCE')")
    public ResponseEntity<String> updateMaintenance(@PathVariable Long maintenance_id, @RequestBody @Valid MaintenanceRequestDto maintenanceRequestDto){
        return ResponseEntity.ok(maintenanceService.updateMaintenance(maintenance_id, maintenanceRequestDto));
    }

    //delete
    @DeleteMapping("/delete/{maintenance_id}")
    @PreAuthorize("hasAuthority('DELETE_MAINTENANCE')")
    public ResponseEntity<Long> deleteMaintenance(@PathVariable Long maintenance_id){
        return ResponseEntity.ok(maintenanceService.deleteMaintenance(maintenance_id));
    }

    //cancel
    @PostMapping("/cancel/{maintenance_id}")
    @PreAuthorize("hasAuthority('CANCEL_MAINTENANCE')")
    public ResponseEntity<String> cancelMaintenance(@PathVariable Long maintenance_id){
        return  ResponseEntity.ok(maintenanceService.cancelMaintenance(maintenance_id));
    }

    //get
    @GetMapping("/{maintenance_id}")
    @PreAuthorize("hasAuthority('GET_MAINTENANCE')")
    public ResponseEntity<MaintenanceResponseDto> getMaintenance(@PathVariable Long maintenance_id){
        return  ResponseEntity.ok(maintenanceService.getMaintenance(maintenance_id));
    }

    //4.getAll
    @GetMapping("/all")
    @PreAuthorize("hasAuthority('GET_ALL_MAINTENANCE')")
    public ResponseEntity<List<MaintenanceResponseDto>> getAllMaintenances(){
        return  ResponseEntity.ok(maintenanceService.getAllMaintenances());
    }

    //5.updatestatus
    @PutMapping("/update_status/{maintenance_id}")
    @PreAuthorize("hasAuthority('UPDATE_MAINTENANCE_STATUS')")
    public ResponseEntity<String> updateMaintenanceStatus(@PathVariable Long maintenance_id, @RequestBody String status){
        return ResponseEntity.ok(maintenanceService.updateMaintenanceStatus(maintenance_id, status));
    }

    @PostMapping(value = "/joinDoc/{maintenance_id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> uploadDocument(
            @PathVariable Long maintenance_id,
            @RequestPart("file") MultipartFile file,
            @RequestPart("data") @Valid DocumentRequestDto documentRequestDto) {
        return ResponseEntity.ok(maintenanceService.joinDoc(maintenance_id, file, documentRequestDto));
    }

}
