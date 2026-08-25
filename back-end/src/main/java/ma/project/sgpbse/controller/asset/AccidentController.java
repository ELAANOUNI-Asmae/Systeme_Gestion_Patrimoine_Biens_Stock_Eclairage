package ma.project.sgpbse.controller.asset;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import ma.project.sgpbse.dto.asset.request.AccidentRequestDto;
import ma.project.sgpbse.dto.asset.response.AccidentResponseDto;
import ma.project.sgpbse.service.asset.AccidentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@AllArgsConstructor

@RestController
@RequestMapping("/sgpbse/accident")
public class AccidentController {

    @Autowired
    private final AccidentService accidentService;

    //déclarer accident
    @PostMapping("/register/{vehicle_id}")
    @PreAuthorize("hasAuthority('REGISTER_ACCIDENT')")
    public ResponseEntity<Long> registerAccident(@PathVariable Long vehicle_id, @RequestBody @Valid AccidentRequestDto accidentRequestDto){
        return ResponseEntity.ok(accidentService.createAccident(vehicle_id, accidentRequestDto));
    }

    //get
    @GetMapping("/{accident_id}")
    @PreAuthorize("hasAuthority('GET_ACCIDENT')")
    public ResponseEntity<AccidentResponseDto> getAccident(@PathVariable Long accident_id){
        return ResponseEntity.ok(accidentService.getAccident(accident_id));
    }

    //getAll
    @GetMapping("/all")
    @PreAuthorize("hasAuthority('GET_ALL_ACCIDENT')")
    public ResponseEntity<List<AccidentResponseDto>> getAllAccidents(){
        return ResponseEntity.ok(accidentService.getAllAccidents());
    }
}
