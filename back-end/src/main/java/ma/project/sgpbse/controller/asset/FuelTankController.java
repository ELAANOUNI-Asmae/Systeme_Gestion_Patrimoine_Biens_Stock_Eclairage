package ma.project.sgpbse.controller.asset;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import ma.project.sgpbse.dto.asset.request.DocumentRequestDto;
import ma.project.sgpbse.dto.asset.request.FuelTankRequestDto;
import ma.project.sgpbse.dto.asset.response.FuelTankResponseDto;
import ma.project.sgpbse.service.asset.FuelTankService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@AllArgsConstructor

@RestController
@RequestMapping("/sgpbse/fuelTank")
public class FuelTankController {

    @Autowired
    private final FuelTankService fuelTankService;

    //refuel Vehicle
    @PostMapping("/reful/{vehicle_id}")
    @PreAuthorize("hasAuthority('REFUL_VEHICLE')")
    public ResponseEntity<Long> refuelVehicle(@PathVariable Long vehicle_id, @RequestBody @Valid FuelTankRequestDto fuelTankRequestDto){
        return ResponseEntity.ok(fuelTankService.refuelVehicle(vehicle_id, fuelTankRequestDto));
    }

    //get
    @GetMapping("/{fuel_tank_id}")
    @PreAuthorize("hasAuthority('GET_FUEL_TANK')")
    public ResponseEntity<FuelTankResponseDto> getFuelTank(@PathVariable Long fuel_tank_id){
        return ResponseEntity.ok(fuelTankService.getFuelTank(fuel_tank_id));
    }

    //getAll
    @GetMapping("/all")
    @PreAuthorize("hasAuthority('GET_ALL_FUEL_TANKS')")
    public ResponseEntity<List<FuelTankResponseDto>> getAllFuelTanks(){
        return ResponseEntity.ok(fuelTankService.getAllFuelTanks());
    }

    @PostMapping(value = "/joinDoc/{fuelTank_id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> uploadDocument(
            @PathVariable Long fuelTank_id,
            @RequestPart("file") MultipartFile file,
            @RequestPart("data") @Valid DocumentRequestDto documentRequestDto) {
        return ResponseEntity.ok(fuelTankService.joinDoc(fuelTank_id, file, documentRequestDto));
    }

}
