package ma.project.sgpbse.controller.asset;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import ma.project.sgpbse.dto.asset.request.MachineRequestDto;
import ma.project.sgpbse.dto.asset.response.MachineResponseDto;
import ma.project.sgpbse.service.asset.MachineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@AllArgsConstructor

@RestController
@RequestMapping("/sgpbse/machine")
public class MachineController {

    @Autowired
    private final MachineService machineService;

    @PostMapping("/create")
    @PreAuthorize("hasAuthority('CREATE_ASSET')")
    public ResponseEntity<MachineResponseDto> createMachine(@RequestBody @Valid MachineRequestDto machineRequestDto){
        return ResponseEntity.status(HttpStatus.CREATED).
                body(machineService.createMachine(machineRequestDto));
    }

    //update
    @PutMapping("/update/{machine_id}")
    @PreAuthorize("hasAuthority('UPDATE_ASSET')")
    public ResponseEntity<Long> updateMachine(@PathVariable Long machine_id,
                                              @RequestBody @Valid MachineRequestDto machineRequestDto){

        return ResponseEntity.status(HttpStatus.OK)
                .body(machineService.updateMachine(machine_id, machineRequestDto));
    }

    //delete
    @DeleteMapping("/delete/{machine_id}")
    @PreAuthorize("hasAuthority('DELETE_ASSET')")
    public ResponseEntity<String> deleteMachine(@PathVariable Long machine_id){
        return ResponseEntity.status(HttpStatus.OK)
                .body(machineService.deleteMachine(machine_id));
    }

    //get
    @GetMapping("/{machine_id}")
    @PreAuthorize("hasAuthority('GET_ASSET')")
    public ResponseEntity<MachineResponseDto> getMachine(@PathVariable Long machine_id){
        return ResponseEntity.status(HttpStatus.OK)
                .body(machineService.getMachine(machine_id));
    }

    //getAll
    @GetMapping("/all")
    @PreAuthorize("hasAuthority('GET_ALL_ASSETS')")
    public ResponseEntity<List<MachineResponseDto>> getAllMachine(){
        return ResponseEntity.status(HttpStatus.OK)
                .body(machineService.getAllMachine());
    }

}
