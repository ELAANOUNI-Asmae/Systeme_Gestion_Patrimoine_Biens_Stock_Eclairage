package ma.project.sgpbse.controller.asset;

import lombok.RequiredArgsConstructor;
import ma.project.sgpbse.dto.asset.response.DocumentResponseDto;
import ma.project.sgpbse.entity.asset.Document;
import ma.project.sgpbse.mapper.asset.DocumentMapper;
import ma.project.sgpbse.service.asset.DocumentService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/sgpbse")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @PostMapping(value = "/asset/{asset_id}/join_docs", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('JOIN_ASSET_DOCS')")
    public ResponseEntity<List<DocumentResponseDto>> joinAssetDocs(
            @PathVariable Long asset_id,
            @RequestParam("files") List<MultipartFile> files, // Utilise @RequestParam ici
            @RequestParam(value = "titles", required = false) List<String> titles) { // Et ici

        return ResponseEntity.ok(documentService.joinAssetDocs(asset_id, files, titles));
    }

    @PostMapping(value = "/maintenance/{maintenance_id}/join_docs", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('JOIN_MAINTENANCE_DOCS')")
    public ResponseEntity<List<DocumentResponseDto>> joinMaintenanceDocs(
            @PathVariable Long maintenance_id,
            @RequestParam("files") List<MultipartFile> files, // Utilise @RequestParam ici
            @RequestParam(value = "titles", required = false) List<String> titles) { // Et ici

        return ResponseEntity.ok(documentService.joinMaintenanceDocs(maintenance_id, files, titles));
    }

    @PostMapping(value = "/rental/{rental_id}/join_docs", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('JOIN_RENTAL_DOCS')")
    public ResponseEntity<List<DocumentResponseDto>> joinRentalDocs(
            @PathVariable Long rental_id,
            @RequestParam("files") List<MultipartFile> files, // Utilise @RequestParam ici
            @RequestParam(value = "titles", required = false) List<String> titles) { // Et ici

        return ResponseEntity.ok(documentService.joinRentalDocs(rental_id, files, titles));
    }

}
