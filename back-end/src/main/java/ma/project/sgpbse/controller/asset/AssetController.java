package ma.project.sgpbse.controller.asset;

import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import ma.project.sgpbse.dto.asset.request.DocumentRequestDto;
import ma.project.sgpbse.entity.asset.Asset;
import ma.project.sgpbse.entity.asset.Document;
import ma.project.sgpbse.enums.AssetStatus;
import ma.project.sgpbse.service.asset.AssetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

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
        return ResponseEntity.ok(assetService.countAllAssets());
    }

    @PostMapping("/update/{asset_id}")
    @PreAuthorize("hasAuthority('COUNT_ASSET')")
    public ResponseEntity<?> updateStatus(@PathVariable Long asset_id, @RequestBody AssetStatus assetStatus){
        return ResponseEntity.ok(assetService.updateStatus(asset_id, assetStatus));
    }

    //join doc
    @PostMapping(value = "/joinDoc/{asset_id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Document> uploadDocument(
            @PathVariable Long asset_id,
            @RequestPart("file") MultipartFile file,
            @RequestPart("data") @Valid DocumentRequestDto documentRequestDto) {
        return ResponseEntity.ok(assetService.joinDoc(asset_id, file, documentRequestDto));
    }

    //search asset by designation, inventory_id or assignment
    @GetMapping("/search")
    @PreAuthorize("hasAuthority('SEARCH_ASSET')")
    public ResponseEntity<Page<Asset>> searchAsset(@RequestParam("query") String query,
                                                   Pageable pageable){
        return ResponseEntity.ok(assetService.searchAsset(query, pageable));
    }

    //get all assets by type
    @GetMapping("/find_by_type")
    @PreAuthorize("hasAuthority('GET_ASSETS_BY_TYPE')")
    public ResponseEntity<List<Asset>> findAllByType(@RequestBody String type){
        return ResponseEntity.ok(assetService.findAllByType(type));
    }

    //get all assets by status
    @GetMapping("/find_by_status")
    @PreAuthorize("hasAuthority('GET_ASSETS_BY_STATUS')")
    public ResponseEntity<List<Asset>> findAllByStatus(@RequestBody AssetStatus status){
        return ResponseEntity.ok(assetService.findAllByStatus(status));
    }

    //get archived assets
    @GetMapping("/archived")
    @PreAuthorize("hasAuthority('GET_ARCHIVED_ASSETS')")
    public ResponseEntity<List<Asset>> findAllArchived(){
        return ResponseEntity.ok(assetService.findAllArchived());
    }

    @GetMapping("/archived/search")
    @PreAuthorize("hasAuthority('SEARCH_ARCHIVED_ASSETS')")
    public ResponseEntity<List<Asset>> searchArchivedAssets(
            @RequestParam(value = "designation", required = false) String designation,
            @RequestParam(value = "inventoryId", required = false) String inventoryId
    ) {
        List<Asset> results = assetService.searchArchivedAssets(designation, inventoryId);
        return ResponseEntity.ok(results);
    }
}
