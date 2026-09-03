package ma.project.sgpbse.controller.asset;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import ma.project.sgpbse.dto.asset.request.DocumentRequestDto;
import ma.project.sgpbse.dto.asset.request.RentalRequestDto;
import ma.project.sgpbse.dto.asset.response.RentalResponseDto;
import ma.project.sgpbse.service.asset.RentalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@AllArgsConstructor

@RestController
@RequestMapping("/sgpbse/rental")
public class RentalController {

    @Autowired
    private final RentalService rentalService;


    //1.rent
    @PostMapping("/rent/{asset_id}")
    @PreAuthorize("hasAuthority('RENT_ASSET')")
    public ResponseEntity<Long> rentAsset(@PathVariable Long asset_id, @RequestBody @Valid RentalRequestDto rentalRequestDto){
        return ResponseEntity.ok(rentalService.createRental(asset_id, rentalRequestDto));
    }

    //2.cancel
    @DeleteMapping("/cancel/{rental_id}")
    @PreAuthorize("hasAuthority('CANCEL_RENTAL')")
    public ResponseEntity<String> cancelRental(@PathVariable Long rental_id){
        return ResponseEntity.ok(rentalService.deleteRental(rental_id));
    }

    //3.update
    @PutMapping("/update/{rental_id}")
    @PreAuthorize("hasAuthority('UPDATE_RENTAL')")
    public ResponseEntity<String> updateRental(@PathVariable Long rental_id, @RequestBody @Valid RentalRequestDto rentalRequestDto){
        return ResponseEntity.ok(rentalService.updateRental(rental_id, rentalRequestDto));
    }

    //4.get
    @GetMapping("/{rental_id}")
    @PreAuthorize("hasAuthority('GET_RENTAL')")
    public ResponseEntity<RentalResponseDto> getRental(@PathVariable Long rental_id){
        return ResponseEntity.ok(rentalService.getRental(rental_id));
    }

    //5.get all
    @GetMapping("/all")
    @PreAuthorize("hasAuthority('GET_ALL_RENTALS')")
    public ResponseEntity<List<RentalResponseDto>> getAllRentals(){
        return ResponseEntity.ok(rentalService.getAllRentals());
    }

    @PostMapping(value = "/joinDoc/{rental_id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> uploadDocument(
            @PathVariable Long rental_id,
            @RequestPart("file") MultipartFile file,
            @RequestPart("data") @Valid DocumentRequestDto documentRequestDto) {
        return ResponseEntity.ok(rentalService.joinDoc(rental_id, file, documentRequestDto));
    }

}
