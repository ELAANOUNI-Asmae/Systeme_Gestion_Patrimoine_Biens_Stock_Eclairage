package ma.project.sgpbse.controller.publicLighting;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import ma.project.sgpbse.dto.asset.request.DocumentRequestDto;
import ma.project.sgpbse.dto.publicLighting.request.LightPointRequestDto;
import ma.project.sgpbse.dto.publicLighting.response.LightPointResponseDto;
import ma.project.sgpbse.dto.publicLighting.response.LightingDocumentResponseDto;
import ma.project.sgpbse.enums.LightPointStatus;
import ma.project.sgpbse.service.publicLighting.LightPointService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@AllArgsConstructor
@RestController
@RequestMapping("/sgpbse/lightPoint")
public class LightPointController {
    private final LightPointService lightPointService;

    @PostMapping("/create") @PreAuthorize("hasAuthority('CREATE_LIGHT_POINT')")
    public ResponseEntity<Long> create(@RequestBody @Valid LightPointRequestDto dto){ return ResponseEntity.ok(lightPointService.createLightPoint(dto)); }

    @PutMapping("/update/{id}") @PreAuthorize("hasAuthority('UPDATE_LIGHT_POINT')")
    public ResponseEntity<LightPointResponseDto> update(@PathVariable Long id, @RequestBody @Valid LightPointRequestDto dto){ return ResponseEntity.ok(lightPointService.updateLightPoint(id, dto)); }

    @DeleteMapping("/delete/{id}") @PreAuthorize("hasAuthority('DELETE_LIGHT_POINT')")
    public ResponseEntity<Long> delete(@PathVariable Long id){ return ResponseEntity.ok(lightPointService.deleteLightPoint(id)); }

    @PutMapping("/updateStatus/{id}") @PreAuthorize("hasAuthority('UPDATE_LIGHT_POINT_STATUS')")
    public ResponseEntity<Long> status(@PathVariable Long id, @RequestBody LightPointStatus status){ return ResponseEntity.ok(lightPointService.updateLightPointStatus(id, status)); }

    @GetMapping("/{id}") @PreAuthorize("hasAuthority('GET_LIGHT_POINT')")
    public ResponseEntity<LightPointResponseDto> get(@PathVariable Long id){ return ResponseEntity.ok(lightPointService.getLightPoint(id)); }

    @GetMapping("/all") @PreAuthorize("hasAuthority('GET_ALL_LIGHT_POINT')")
    public ResponseEntity<List<LightPointResponseDto>> all(){ return ResponseEntity.ok(lightPointService.getAllLightPoints()); }

    @GetMapping("/public/all")
    public ResponseEntity<List<LightPointResponseDto>> publicAll(){ return ResponseEntity.ok(lightPointService.getPublicLightPoints()); }

    @GetMapping("/count_by_status") @PreAuthorize("hasAuthority('COUNT_LIGHT_POINTS_BY_STATUS')")
    public ResponseEntity<Long> count(@RequestParam("status") LightPointStatus status){ return ResponseEntity.ok(lightPointService.countAllLightPointsByStatus(status)); }

    @GetMapping("/filter_by_status") @PreAuthorize("hasAuthority('FILTER_LIGHT_POINTS_BY_STATUS')")
    public ResponseEntity<List<LightPointResponseDto>> filter(@RequestParam("status") LightPointStatus status){ return ResponseEntity.ok(lightPointService.filterByStatus(status)); }

    @GetMapping("/search") @PreAuthorize("hasAuthority('SEARCH_LIGHT_POINTS')")
    public ResponseEntity<List<LightPointResponseDto>> search(@RequestParam(required=false,name="designation_ar") String ar, @RequestParam(required=false,name="designation_fr") String fr, @RequestParam(required=false) String location){
        return ResponseEntity.ok(lightPointService.searchGlobally(ar, fr, location));
    }

    @PostMapping(value="/joinDoc/{id}", consumes=MediaType.MULTIPART_FORM_DATA_VALUE) @PreAuthorize("hasAnyAuthority('CREATE_LIGHT_POINT','UPDATE_LIGHT_POINT')")
    public ResponseEntity<LightingDocumentResponseDto> joinDoc(@PathVariable Long id, @RequestPart("file") MultipartFile file, @RequestPart("data") @Valid DocumentRequestDto dto){
        return ResponseEntity.ok(lightPointService.joinDoc(id, file, dto));
    }

    @DeleteMapping("/{id}/document/{documentId}") @PreAuthorize("hasAuthority('UPDATE_LIGHT_POINT')")
    public ResponseEntity<Void> deleteDoc(@PathVariable Long id, @PathVariable Long documentId){ lightPointService.deleteDocument(id, documentId); return ResponseEntity.noContent().build(); }
}
