package ma.project.sgpbse.controller.publicLighting;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import ma.project.sgpbse.dto.asset.request.DocumentRequestDto;
import ma.project.sgpbse.dto.publicLighting.request.FailureRequestDto;
import ma.project.sgpbse.dto.publicLighting.response.FailureResponseDto;
import ma.project.sgpbse.dto.publicLighting.response.LightingDocumentResponseDto;
import ma.project.sgpbse.dto.publicLighting.response.PublicFailureSummaryDto;
import ma.project.sgpbse.service.publicLighting.FailureService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@AllArgsConstructor
@RestController
@RequestMapping("/sgpbse/failure")
public class FailureController {
    private final FailureService failureService;

    @PostMapping("/report") @PreAuthorize("hasAuthority('REPORT_FAILURE')")
    public ResponseEntity<FailureResponseDto> report(@RequestBody @Valid FailureRequestDto dto){ return ResponseEntity.ok(failureService.reportFailure(dto)); }

    @PostMapping("/report/{lightPointId}") @PreAuthorize("hasAuthority('REPORT_FAILURE')")
    public ResponseEntity<FailureResponseDto> reportById(@PathVariable Long lightPointId, @RequestBody @Valid FailureRequestDto dto){ return ResponseEntity.ok(failureService.reportFailureByLightId(lightPointId, dto)); }

    @PostMapping("/public/report/{lightPointId}")
    public ResponseEntity<FailureResponseDto> publicReport(@PathVariable Long lightPointId, @RequestBody @Valid FailureRequestDto dto){ dto.setReportedBy("PUBLIC"); return ResponseEntity.ok(failureService.reportFailureByLightId(lightPointId, dto)); }

    @GetMapping("/public/open")
    public ResponseEntity<List<PublicFailureSummaryDto>> publicOpen(){ return ResponseEntity.ok(failureService.getPublicOpenFailures()); }

    @GetMapping("/{id}") @PreAuthorize("hasAuthority('GET_FAILURE')")
    public ResponseEntity<FailureResponseDto> get(@PathVariable Long id){ return ResponseEntity.ok(failureService.getFailure(id)); }

    @GetMapping("/all") @PreAuthorize("hasAuthority('GET_ALL_FAILURE')")
    public ResponseEntity<List<FailureResponseDto>> all(){ return ResponseEntity.ok(failureService.getAllFailures()); }

    @PostMapping(value="/joinDoc/{id}", consumes=MediaType.MULTIPART_FORM_DATA_VALUE) @PreAuthorize("hasAuthority('REPORT_FAILURE')")
    public ResponseEntity<LightingDocumentResponseDto> joinDoc(@PathVariable Long id, @RequestPart("file") MultipartFile file, @RequestPart("data") @Valid DocumentRequestDto dto){ return ResponseEntity.ok(failureService.joinDoc(id, file, dto)); }

    @PostMapping(value="/public/joinDoc/{id}", consumes=MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<LightingDocumentResponseDto> publicJoinDoc(@PathVariable Long id, @RequestPart("file") MultipartFile file, @RequestPart("data") @Valid DocumentRequestDto dto){ return ResponseEntity.ok(failureService.joinDoc(id, file, dto)); }
}
