package ma.project.sgpbse.controller.asset;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import ma.project.sgpbse.dto.asset.request.DisposalRequestDto;
import ma.project.sgpbse.dto.asset.request.DocumentRequestDto;
import ma.project.sgpbse.dto.asset.response.DisposalResponseDto;
import ma.project.sgpbse.service.asset.DisposalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@AllArgsConstructor

@RestController
@RequestMapping("/sgpbse/disposal")
public class DisposalController {

    @Autowired
    private final DisposalService disposalService;

    //disposeAsset()
    @PostMapping("/dispose/{asset_id}")
    @PreAuthorize("hasAuthority('DISPOSE_ASSET')")
    public ResponseEntity<Long> disposeAsset(@PathVariable Long asset_id, @RequestBody @Valid DisposalRequestDto disposalRequestDto){
        return ResponseEntity.ok(disposalService.createDisposal(asset_id, disposalRequestDto));
    }


    //get
    @GetMapping("/{disposal_id}")
    @PreAuthorize("hasAuthority('GET_DISPOSAL')")
    public ResponseEntity<DisposalResponseDto> getDisposal(@PathVariable Long disposal_id){
        return ResponseEntity.ok(disposalService.getDisposal(disposal_id));
    }

    //getAll
    @GetMapping("/all")
    @PreAuthorize("hasAuthority('GET_ALL_DISPOSALS')")
    public ResponseEntity<List<DisposalResponseDto>> getAllDisposals(){
        return ResponseEntity.ok(disposalService.getAllDisposals());
    }

    @PostMapping(value = "/joinDoc/{disposal_id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> uploadDocument(
            @PathVariable Long disposal_id,
            @RequestPart("file") MultipartFile file,
            @RequestPart("data") @Valid DocumentRequestDto documentRequestDto) {
        return ResponseEntity.ok(disposalService.joinDoc(disposal_id, file, documentRequestDto));
    }

}
