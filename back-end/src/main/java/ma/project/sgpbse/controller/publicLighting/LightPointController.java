package ma.project.sgpbse.controller.publicLighting;

import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import ma.project.sgpbse.dto.publicLighting.request.LightPointRequestDto;
import ma.project.sgpbse.dto.publicLighting.response.LightPointResponseDto;
import ma.project.sgpbse.entity.publicLighting.LightPoint;
import ma.project.sgpbse.enums.LightPointStatus;
import ma.project.sgpbse.service.publicLighting.LightPointService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@AllArgsConstructor

@RestController
@RequestMapping("/sgpbse/lightPoint")
public class LightPointController {

    @Autowired
    private final LightPointService lightPointService;

    //create light point
    @PostMapping("/create")
    @PreAuthorize("hasAuthority('CREATE_LIGHT_POINT')")
    public ResponseEntity<Long> createLightPoint(@RequestBody @Valid LightPointRequestDto lightPointRequestDto) throws IllegalAccessException {
        return  ResponseEntity.ok(lightPointService.createLightPoint(lightPointRequestDto));
    }

    //update
    @PutMapping("/update/{lightPoint_id}")
    @PreAuthorize("hasAuthority('UPDATE_LIGHT_POINT')")
    public ResponseEntity<LightPoint> updateLightPoint(@PathVariable Long lightPoint_id, @RequestBody @Valid LightPointRequestDto lightPointRequestDto) {
        return ResponseEntity.ok(lightPointService.updateLightPoint(lightPoint_id, lightPointRequestDto));
    }

    //delete
    @DeleteMapping("/delete/{lightPoint_id}")
    @PreAuthorize("hasAuthority('DELETE_LIGHT_POINT')")
    public ResponseEntity<Long>  deleteLightPoint(@PathVariable Long lightPoint_id) {
        return  ResponseEntity.ok(lightPointService.deleteLightPoint(lightPoint_id));
    }

    //update status
    @PutMapping("/updateStatus/{lightPoint_id}")
    @PreAuthorize("hasAuthority('UPDATE_LIGHT_POINT_STATUS')")
    public ResponseEntity<Long> updateLightPointStatus(@PathVariable Long lightPoint_id,@RequestBody @Valid LightPointStatus lightPointStatus) {
        return ResponseEntity.ok(lightPointService.updateLightPointStatus(lightPoint_id, lightPointStatus));
    }

    //get
    @GetMapping("/{lightPoint_id}")
    @PreAuthorize("hasAuthority('GET_LIGHT_POINT')")
    public ResponseEntity<LightPointResponseDto> getLightPoint(@PathVariable Long lightPoint_id) {
        return ResponseEntity.ok(lightPointService.getLightPoint(lightPoint_id));
    }

    //getAll
    @GetMapping("/all")
    @PreAuthorize("hasAuthority('GET_ALL_LIGHT_POINT')")
    public ResponseEntity<List<LightPointResponseDto>> getAllLightPoints(){
        return ResponseEntity.ok(lightPointService.getAllLightPoints());
    }

    //get total light points by status
    @GetMapping("/count_by_status")
    @PreAuthorize("hasAuthority('COUNT_LIGHT_POINTS_BY_STATUS')")
    public ResponseEntity<Long> countAllLightPointsByStatus(@RequestPart(name = "status") LightPointStatus lightPointStatus){
        return ResponseEntity.ok(lightPointService.countAllLightPointsByStatus(lightPointStatus));
    }

    //filter light points by status
    @GetMapping("/filter_by_status")
    @PreAuthorize("hasAuthority('FILTER_LIGHT_POINTS_BY_STATUS')")
    public ResponseEntity<List<LightPoint>> filterByStatus(@RequestPart(name = "status") LightPointStatus lightPointStatus){
        return ResponseEntity.ok(lightPointService.filterByStatus(lightPointStatus));
    }

    //search by designation fr/ar or location
    @GetMapping("/search")
    @PreAuthorize("hasAuthority('SEARCH_LIGHT_POINTS')")
    public List<LightPoint> searchGlobally(@RequestPart(name = "designation_ar") String designationAr,
                                           @RequestPart(name = "designation_fr") String designationFr,
                                           @RequestPart(name = "location") String location){
        return lightPointService.searchGlobally(designationAr, designationFr, location);
    }
}
