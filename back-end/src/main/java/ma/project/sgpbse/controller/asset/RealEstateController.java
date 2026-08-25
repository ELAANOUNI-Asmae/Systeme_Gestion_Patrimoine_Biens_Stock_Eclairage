package ma.project.sgpbse.controller.asset;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import ma.project.sgpbse.dto.asset.request.RealEstateRequestDto;
import ma.project.sgpbse.dto.asset.response.RealEstateResponseDto;
import ma.project.sgpbse.service.asset.RealEstateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@AllArgsConstructor

@RestController
@RequestMapping("/sgpbse/real_estate")
public class RealEstateController {
    @Autowired
    private final RealEstateService realEstateService;

    @PostMapping("/create")
    @PreAuthorize("hasAuthority('CREATE_ASSET')")
    public ResponseEntity<RealEstateResponseDto> createRealEstate(@RequestBody @Valid RealEstateRequestDto realEstateRequestDto){
        return ResponseEntity.status(HttpStatus.CREATED).
                body(realEstateService.createRealEstate(realEstateRequestDto));
    }

    //update
    @PutMapping("/update/{real_estate_id}")
    @PreAuthorize("hasAuthority('UPDATE_ASSET')")
    public ResponseEntity<Long> updateRealEstate(@PathVariable Long real_estate_id,
                                              @RequestBody @Valid RealEstateRequestDto realEstateRequestDto){

        return ResponseEntity.status(HttpStatus.OK)
                .body(realEstateService.updateRealEstate(real_estate_id, realEstateRequestDto));
    }

    //delete
    @DeleteMapping("/delete/{real_estate_id}")
    @PreAuthorize("hasAuthority('DELETE_ASSET')")
    public ResponseEntity<String> deleteRealEstate(@PathVariable Long real_estate_id){
        return ResponseEntity.status(HttpStatus.OK)
                .body(realEstateService.deleteRealEstate(real_estate_id));
    }

    //get
    @GetMapping("/{real_estate_id}")
    @PreAuthorize("hasAuthority('GET_ASSET')")
    public ResponseEntity<RealEstateResponseDto> getRealEstate(@PathVariable Long real_estate_id){
        return ResponseEntity.status(HttpStatus.OK)
                .body(realEstateService.getRealEstate(real_estate_id));
    }

    //getAll
    @GetMapping("/all")
    @PreAuthorize("hasAuthority('GET_ALL_ASSETS')")
    public ResponseEntity<List<RealEstateResponseDto>> getAllRealEstates(){
        return ResponseEntity.status(HttpStatus.OK)
                .body(realEstateService.getAllRealEstates());
    }

}
