package ma.project.sgpbse.controller.stock;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import ma.project.sgpbse.dto.asset.request.DocumentRequestDto;
import ma.project.sgpbse.dto.stock.request.ItemReqDto;
import ma.project.sgpbse.dto.stock.response.ItemResDto;
import ma.project.sgpbse.dto.stock.response.StockDocumentResponseDto;
import ma.project.sgpbse.entity.stock.ItemStatistics;
import ma.project.sgpbse.service.stock.ItemService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@AllArgsConstructor
@RestController
@RequestMapping("/sgpbse/item")
public class ItemController {

    private final ItemService itemService;

    @PostMapping("/create")
    @PreAuthorize("hasAuthority('CREATE_ITEM')")
    public ResponseEntity<ItemResDto> createItem(@RequestBody @Valid ItemReqDto dto) {
        return ResponseEntity.ok(itemService.createItem(dto));
    }

    @DeleteMapping("/delete/{item_id}")
    @PreAuthorize("hasAuthority('DELETE_ITEM')")
    public ResponseEntity<Long> deleteItem(@PathVariable Long item_id) {
        return ResponseEntity.ok(itemService.deleteItem(item_id));
    }

    @PutMapping("/update/{item_id}")
    @PreAuthorize("hasAuthority('UPDATE_ITEM')")
    public ResponseEntity<ItemResDto> updateItem(@PathVariable Long item_id, @RequestBody @Valid ItemReqDto dto) {
        return ResponseEntity.ok(itemService.updateItem(item_id, dto));
    }

    @PutMapping("/updateQuantity/{item_id}")
    @PreAuthorize("hasAuthority('UPDATE_ITEM_QUANTITY')")
    public ResponseEntity<Void> updateItemQuantity(@PathVariable Long item_id, @RequestBody Long new_quantity) {
        itemService.updateItemQuantity(item_id, new_quantity);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{item_id}")
    @PreAuthorize("hasAuthority('GET_ITEM')")
    public ResponseEntity<ItemResDto> getItem(@PathVariable Long item_id) {
        return ResponseEntity.ok(itemService.getItem(item_id));
    }

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('GET_ALL_ITEMS')")
    public ResponseEntity<List<ItemResDto>> getAllItems() {
        return ResponseEntity.ok(itemService.getAllItems());
    }

    @GetMapping("/stat/{item_id}")
    @PreAuthorize("hasAuthority('GET_ITEM_STAT')")
    public ResponseEntity<ItemStatistics> getItemStatBySerialNumber(@PathVariable Long item_id) {
        return ResponseEntity.ok(itemService.getItemStatBySerialNumber(item_id));
    }

    @GetMapping("/total")
    @PreAuthorize("hasAuthority('COUNT_ITEMS')")
    public ResponseEntity<Long> countTotalItems() { return ResponseEntity.ok(itemService.countAllItems()); }

    @GetMapping("/total/quantities")
    @PreAuthorize("hasAuthority('COUNT_TOTAL_QUANTITIES')")
    public ResponseEntity<Long> countTotalQuantities() { return ResponseEntity.ok(itemService.countTotalQuantities()); }

    @GetMapping("/search")
    @PreAuthorize("hasAuthority('SEARCH_ITEM')")
    public ResponseEntity<List<ItemResDto>> searchItem(
            @RequestParam(value = "serialNumber", required = false) String serialNumber,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "brand", required = false) String brand) {
        return ResponseEntity.ok(itemService.searchItem(serialNumber, name, brand));
    }

    @GetMapping("/low")
    @PreAuthorize("hasAuthority('GET_ITEMS_WITH_LOW_STOCK')")
    public ResponseEntity<List<ItemResDto>> lowItems() { return ResponseEntity.ok(itemService.filterByLowStockStatus()); }

    @GetMapping("/stock_movement/all/{item_id}")
    @PreAuthorize("hasAuthority('GET_STOCK_MOVEMENT_PER_ITEM')")
    public ResponseEntity<Integer> countTotalMovementPerArticle(@PathVariable Long item_id) {
        return ResponseEntity.ok(itemService.countTotalMovementPerArticle(item_id));
    }

    @PostMapping(value = "/joinDoc/{item_id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyAuthority('CREATE_ITEM','UPDATE_ITEM')")
    public ResponseEntity<StockDocumentResponseDto> uploadDocument(
            @PathVariable Long item_id,
            @RequestPart("file") MultipartFile file,
            @RequestPart("data") @Valid DocumentRequestDto dto) {
        return ResponseEntity.ok(itemService.joinDoc(item_id, file, dto));
    }

    @DeleteMapping("/{item_id}/document/{document_id}")
    @PreAuthorize("hasAuthority('UPDATE_ITEM')")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long item_id, @PathVariable Long document_id) {
        itemService.deleteDocument(item_id, document_id);
        return ResponseEntity.noContent().build();
    }
}
