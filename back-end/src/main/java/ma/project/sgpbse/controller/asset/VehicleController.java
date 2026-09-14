package ma.project.sgpbse.controller.asset;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import ma.project.sgpbse.dto.asset.request.VehicleRequestDto;
import ma.project.sgpbse.dto.asset.response.VehicleResponseDto;
import ma.project.sgpbse.service.asset.VehicleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@AllArgsConstructor

@RestController
@RequestMapping("/sgpbse/vehicle")
public class VehicleController {

    @Autowired
    private final VehicleService vehicleService;

    @PostMapping("/create")
    @PreAuthorize("hasAuthority('CREATE_ASSET')")
    public ResponseEntity<VehicleResponseDto> createVehicle(@RequestBody @Valid VehicleRequestDto vehicleRequestDto){
        return ResponseEntity.status(HttpStatus.CREATED).
                body(vehicleService.createVehicle(vehicleRequestDto));
    }

    //update
    @PutMapping("/update/{vehicle_id}")
    @PreAuthorize("hasAuthority('UPDATE_ASSET')")
    public ResponseEntity<Long> updateVehicle(@PathVariable Long vehicle_id,
                                              @RequestBody @Valid VehicleRequestDto vehicleRequestDto){

        return ResponseEntity.status(HttpStatus.OK)
                .body(vehicleService.updateVehicle(vehicle_id, vehicleRequestDto));
    }

    //delete
    @DeleteMapping("/delete/{vehicle_id}")
    @PreAuthorize("hasAuthority('DELETE_ASSET')")
    public ResponseEntity<String> deleteVehicle(@PathVariable Long vehicle_id){
        return ResponseEntity.status(HttpStatus.OK)
                .body(vehicleService.deleteVehicle(vehicle_id));
    }

    //get
    @GetMapping("/{vehicle_id}")
    @PreAuthorize("hasAuthority('GET_ASSET')")
    public ResponseEntity<VehicleResponseDto> getVehicle(@PathVariable Long vehicle_id){
        return ResponseEntity.status(HttpStatus.OK)
                .body(vehicleService.getVehicle(vehicle_id));
    }

    //getAll
    @GetMapping("/all")
    @PreAuthorize("hasAuthority('GET_ALL_ASSETS')")
    public ResponseEntity<List<VehicleResponseDto>> getAllVehicles(){
        return ResponseEntity.status(HttpStatus.OK)
                .body(vehicleService.getAllVehicles());
    }
}
