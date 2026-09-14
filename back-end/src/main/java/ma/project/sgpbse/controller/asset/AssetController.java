package ma.project.sgpbse.controller.asset;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import ma.project.sgpbse.dto.asset.request.DocumentRequestDto;
import ma.project.sgpbse.dto.asset.response.AssetResponseDto;
import ma.project.sgpbse.entity.asset.Asset;
import ma.project.sgpbse.enums.AssetStatus;
import ma.project.sgpbse.service.asset.AssetService;
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

    private final AssetService assetService;

    @GetMapping("/infos/{asset_id}")
    @PreAuthorize("hasAuthority('GET_ASSET_INFOS')")
    public ResponseEntity<AssetResponseDto> getAsset(
            @PathVariable Long asset_id
    ){
        return ResponseEntity.ok(
                assetService.getAsset(asset_id)
        );
    }

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('GET_ALL_ASSETS')")
    public ResponseEntity<List<AssetResponseDto>> getAllAssets(){
        return ResponseEntity.ok(
                assetService.getAllAssets()
        );
    }

    @GetMapping("/count")
    @PreAuthorize("hasAuthority('COUNT_ASSET')")
    public ResponseEntity<Long> countAssets(){
        return ResponseEntity.ok(
                assetService.countAllAssets()
        );
    }

    @GetMapping("/count/{status}")
    @PreAuthorize("hasAuthority('COUNT_ASSET')")
    public ResponseEntity<Long> countAssetsByStatus(
            @PathVariable AssetStatus status
    ){
        return ResponseEntity.ok(
                assetService.countAllAssetsByStatus(status)
        );
    }

    @PostMapping("/update/{asset_id}")
    @PreAuthorize("hasAuthority('UPDATE_ASSET')")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long asset_id,
            @RequestBody AssetStatus assetStatus
    ){
        /*
         * RENTED, UNDER_MAINTENANCE, DISPOSED et ARCHIVED sont pilotés
         * par leurs opérations métier dédiées.
         */
        if (
                assetStatus == AssetStatus.RENTED
                || assetStatus == AssetStatus.UNDER_MAINTENANCE
                || assetStatus == AssetStatus.DISPOSED
                || assetStatus == AssetStatus.ARCHIVED
        ) {
            return ResponseEntity.badRequest().body(
                    "This status must be changed through its business operation."
            );
        }

        return ResponseEntity.ok(
                assetService.updateStatus(asset_id, assetStatus)
        );
    }

    @PostMapping(
            value = "/joinDoc/{asset_id}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @PreAuthorize("hasAuthority('UPDATE_ASSET')")
    public ResponseEntity<String> uploadDocument(
            @PathVariable Long asset_id,
            @RequestPart("file") MultipartFile file,
            @RequestPart("data") @Valid DocumentRequestDto documentRequestDto
    ){
        /*
         * Le service retourne l'entité Document. On ne la sérialise pas ici
         * pour éviter les graphes JPA bidirectionnels dans la réponse HTTP.
         */
        assetService.joinDoc(
                asset_id,
                file,
                documentRequestDto
        );

        return ResponseEntity.ok(
                "uploaded successfully !"
        );
    }

    @GetMapping("/search")
    @PreAuthorize("hasAuthority('SEARCH_ASSET')")
    public ResponseEntity<Page<Asset>> searchAsset(
            @RequestParam("query") String query,
            Pageable pageable
    ){
        return ResponseEntity.ok(
                assetService.searchAsset(query, pageable)
        );
    }

    @GetMapping("/find_by_type")
    @PreAuthorize("hasAuthority('GET_ASSETS_BY_TYPE')")
    public ResponseEntity<List<Asset>> findAllByType(
            @RequestParam("type") String type
    ){
        return ResponseEntity.ok(
                assetService.findAllByType(type)
        );
    }

    @GetMapping("/find_by_status")
    @PreAuthorize("hasAuthority('GET_ASSETS_BY_STATUS')")
    public ResponseEntity<List<Asset>> findAllByStatus(
            @RequestParam("status") AssetStatus status
    ){
        return ResponseEntity.ok(
                assetService.findAllByStatus(status)
        );
    }

    @GetMapping("/archived")
    @PreAuthorize("hasAuthority('GET_ARCHIVED_ASSETS')")
    public ResponseEntity<List<AssetResponseDto>> findAllArchived(){
        return ResponseEntity.ok(
                assetService.findAllArchived()
        );
    }

    @GetMapping("/archived/search")
    @PreAuthorize("hasAuthority('SEARCH_ARCHIVED_ASSETS')")
    public ResponseEntity<List<Asset>> searchArchivedAssets(
            @RequestParam(
                    value = "designation",
                    required = false
            ) String designation,
            @RequestParam(
                    value = "inventoryId",
                    required = false
            ) String inventoryId
    ){
        return ResponseEntity.ok(
                assetService.searchArchivedAssets(
                        designation,
                        inventoryId
                )
        );
    }
}
