package ma.project.sgpbse.controller.asset;


import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import ma.project.sgpbse.dto.asset.request.DocumentRequestDto;
import ma.project.sgpbse.enums.AssetStatus;
import ma.project.sgpbse.service.asset.AssetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@AllArgsConstructor

@RestController
@RequestMapping("/sgpbse/asset")
public class AssetController {

    @Autowired
    private final AssetService assetService;


    @PreAuthorize("hasAuthority('GET_ASSET_INFOS')")
    @GetMapping("/infos/{asset_id}")
    public ResponseEntity<?> getAsset(@PathVariable Long asset_id){
        return ResponseEntity.ok(assetService.getAsset(asset_id));
    }

    @PreAuthorize("hasAuthority('GET_ALL_ASSETS')")
    @GetMapping("/all")
    public ResponseEntity<?> getAllAssets(){
        return ResponseEntity.ok(assetService.getAllAssets());
    }

    @GetMapping("/count")
    @PreAuthorize("hasAuthority('COUNT_ASSET')")
    public ResponseEntity<?> countAssets(){
        return ResponseEntity.ok(assetService.count());
    }

    @PostMapping("/update/{asset_id}")
    @PreAuthorize("hasAuthority('COUNT_ASSET')")
    public ResponseEntity<?> updateStatus(@PathVariable Long asset_id, @RequestBody AssetStatus assetStatus){
        return ResponseEntity.ok(assetService.updateStatus(asset_id, assetStatus));
    }

    //join doc
    @PostMapping(value = "/joinDoc/{asset_id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> uploadDocument(
            @PathVariable Long asset_id,
            @RequestPart("file") MultipartFile file,
            @RequestPart("data") @Valid DocumentRequestDto documentRequestDto) {
        return ResponseEntity.ok(assetService.joinDoc(asset_id, file, documentRequestDto));
    }
}
