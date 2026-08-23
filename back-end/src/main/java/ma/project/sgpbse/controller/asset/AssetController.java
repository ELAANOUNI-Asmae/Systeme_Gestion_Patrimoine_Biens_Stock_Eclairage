package ma.project.sgpbse.controller.asset;


import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import ma.project.sgpbse.dto.asset.request.AssetDtoRequest;
import ma.project.sgpbse.service.asset.AssetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@AllArgsConstructor

@RestController
@RequestMapping("/sgpbse/asset")
public class AssetController {

    @Autowired
    private final AssetService assetService;

    @PreAuthorize("hasAuthority('CREATE_ASSET')")
    @PostMapping("/create")
    public ResponseEntity<?> createAsset(@RequestBody @Valid AssetDtoRequest assetDtoRequest){
        return ResponseEntity.ok(assetService.createAsset(assetDtoRequest));
    }

    @PreAuthorize("hasAuthority('UPDATE_ASSET')")
    @PutMapping("/update/{asset_id}")
    public ResponseEntity<?> updateAsset(@RequestBody @Valid AssetDtoRequest assetDtoRequest, @PathVariable Long asset_id){
        return ResponseEntity.ok(assetService.updateAsset(assetDtoRequest, asset_id));
    }

    @PreAuthorize("hasAuthority('DELETE_ASSET')")
    @DeleteMapping("/delete/{asset_id}")
    public ResponseEntity<?> deleteAsset(@PathVariable Long asset_id){
        return ResponseEntity.ok(assetService.deleteAsset(asset_id));
    }

    @PreAuthorize("hasAuthority('GET_ASSET_INFOS')")
    @GetMapping("/infos/{asset_id}")
    public ResponseEntity<?> getAssetInfos(@PathVariable Long asset_id){
        return ResponseEntity.ok(assetService.getAssetInfos(asset_id));
    }

    @PreAuthorize("hasAuthority('GET_ALL_ASSETS')")
    @GetMapping("/all")
    public ResponseEntity<?> getAllAssets(){
        return ResponseEntity.ok(assetService.getAllAssets());
    }
}
