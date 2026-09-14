package ma.project.sgpbse.controller.stock;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import ma.project.sgpbse.dto.asset.request.DocumentRequestDto;
import ma.project.sgpbse.dto.stock.request.StockMovementRequestDto;
import ma.project.sgpbse.dto.stock.response.StockDocumentResponseDto;
import ma.project.sgpbse.dto.stock.response.StockMovementResponseDto;
import ma.project.sgpbse.service.stock.StockMovementService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@AllArgsConstructor
@RestController
@RequestMapping("/sgpbse/stockMovement")
public class StockMovementController {
    private final StockMovementService stockMovementService;

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('GET_STOCK_MOVEMENT_PER_ITEM')")
    public ResponseEntity<List<StockMovementResponseDto>> getAll() {
        return ResponseEntity.ok(stockMovementService.getAll());
    }

    @GetMapping("/item/{item_id}")
    @PreAuthorize("hasAuthority('GET_STOCK_MOVEMENT_PER_ITEM')")
    public ResponseEntity<List<StockMovementResponseDto>> getByItem(@PathVariable Long item_id) {
        return ResponseEntity.ok(stockMovementService.getByItem(item_id));
    }

    @PostMapping("/entry/{item_id}")
    @PreAuthorize("hasAuthority('CREATE_IN_STOCK')")
    public ResponseEntity<StockMovementResponseDto> entry(@PathVariable Long item_id, @RequestBody @Valid StockMovementRequestDto dto) {
        return ResponseEntity.ok(stockMovementService.createEntry(item_id, dto));
    }

    @PostMapping("/exit/{item_id}")
    @PreAuthorize("hasAuthority('UPDATE_ITEM_QUANTITY')")
    public ResponseEntity<StockMovementResponseDto> exit(@PathVariable Long item_id, @RequestBody @Valid StockMovementRequestDto dto) {
        return ResponseEntity.ok(stockMovementService.createExit(item_id, dto));
    }

    @PostMapping(value = "/joinDoc/{movement_id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyAuthority('CREATE_IN_STOCK','UPDATE_ITEM_QUANTITY')")
    public ResponseEntity<StockDocumentResponseDto> joinDoc(
            @PathVariable Long movement_id,
            @RequestPart("file") MultipartFile file,
            @RequestPart("data") @Valid DocumentRequestDto dto) {
        return ResponseEntity.ok(stockMovementService.joinDoc(movement_id, file, dto));
    }
}
