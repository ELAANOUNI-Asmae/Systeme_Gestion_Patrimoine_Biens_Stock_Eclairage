package ma.project.sgpbse.controller.publicLighting;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import ma.project.sgpbse.dto.publicLighting.request.FailureRequestDto;
import ma.project.sgpbse.dto.publicLighting.response.FailureResponseDto;
import ma.project.sgpbse.service.publicLighting.FailureService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@AllArgsConstructor

@RestController
@RequestMapping("/sgpbse/failure")
public class FailureController {

    @Autowired
    private final FailureService failureService;

    //déclarer une panne
    @PostMapping("/report")
    @PreAuthorize("hasAuthority('REPORT_FAILURE')")
    public ResponseEntity<FailureResponseDto> reportFailure(@RequestBody @Valid FailureRequestDto failureRequestDto){
        return ResponseEntity.ok(failureService.reportFailure(failureRequestDto));
    }

    //get failure
    @GetMapping("/{failure_id}")
    @PreAuthorize("hasAuthority('GET_FAILURE')")
    public ResponseEntity<FailureResponseDto> getFailure(@PathVariable Long failure_id){
        return  ResponseEntity.ok(failureService.getFailure(failure_id));
    }

    //get all failures
    @GetMapping("/all")
    @PreAuthorize("hasAuthority('GET_ALL_FAILURE')")
    public ResponseEntity<List<FailureResponseDto>> getAllFailures(){
        return  ResponseEntity.ok(failureService.getAllFailures());
    }
}
