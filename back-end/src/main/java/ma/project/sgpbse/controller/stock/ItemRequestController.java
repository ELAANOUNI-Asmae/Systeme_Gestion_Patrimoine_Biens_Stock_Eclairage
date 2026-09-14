package ma.project.sgpbse.controller.stock;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import ma.project.sgpbse.dto.asset.request.DocumentRequestDto;
import ma.project.sgpbse.dto.stock.request.ItemRequestDto;
import ma.project.sgpbse.dto.stock.response.ItemRequestResponseDto;
import ma.project.sgpbse.dto.stock.response.StockDocumentResponseDto;
import ma.project.sgpbse.enums.ItemRequestStatus;
import ma.project.sgpbse.service.stock.ItemRequestService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@AllArgsConstructor
@RestController
@RequestMapping("/sgpbse/itemRequest")
public class ItemRequestController {
    private final ItemRequestService itemRequestService;

    @PostMapping("/create/{item_id}")
    @PreAuthorize("hasAuthority('CREATE_ITEM_REQUEST')")
    public ResponseEntity<ItemRequestResponseDto> create(@PathVariable Long item_id, @RequestBody @Valid ItemRequestDto dto) { return ResponseEntity.ok(itemRequestService.createItemRequest(item_id, dto)); }

    @PostMapping("/cancel/{id}")
    @PreAuthorize("hasAuthority('CANCEL_ITEM_REQUEST')")
    public ResponseEntity<ItemRequestResponseDto> cancel(@PathVariable Long id) { return ResponseEntity.ok(itemRequestService.cancelItemRequest(id)); }

    @PostMapping("/aprouve/{id}")
    @PreAuthorize("hasAuthority('APROUVE_ITEM_REQUEST')")
    public ResponseEntity<ItemRequestResponseDto> approve(@PathVariable Long id) { return ResponseEntity.ok(itemRequestService.aprouveItemRequest(id)); }

    @PostMapping("/reject/{id}")
    @PreAuthorize("hasAuthority('REJECT_ITEM_REQUEST')")
    public ResponseEntity<ItemRequestResponseDto> reject(@PathVariable Long id, @RequestBody String justif) { return ResponseEntity.ok(itemRequestService.rejectItemRequest(id, justif)); }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('GET_ITEM_REQUEST')")
    public ResponseEntity<ItemRequestResponseDto> get(@PathVariable Long id) { return ResponseEntity.ok(itemRequestService.getItemRequest(id)); }

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('GET_ALL_ITEM_REQUESTS')")
    public ResponseEntity<List<ItemRequestResponseDto>> all() { return ResponseEntity.ok(itemRequestService.getAllItemRequests()); }

    @GetMapping("/count_by_status")
    @PreAuthorize("hasAuthority('COUNT_ITEM_REQUESTS_BY_STATUS')")
    public ResponseEntity<Long> count(@RequestParam ItemRequestStatus status) { return ResponseEntity.ok(itemRequestService.countItemRequestsByStatus(status)); }

    @PostMapping("/confirm/{id}")
    @PreAuthorize("hasAuthority('CONFIRM_ITEM_REQUEST_DELIVERY')")
    public ResponseEntity<ItemRequestResponseDto> confirm(@PathVariable Long id) throws IllegalAccessException { return ResponseEntity.ok(itemRequestService.confirmDelivration(id)); }

    @GetMapping("/filter_by_user/{user_id}")
    @PreAuthorize("hasAuthority('FILTER_ITEM_REQUESTS_BY_USER')")
    public ResponseEntity<List<ItemRequestResponseDto>> byUser(@PathVariable Long user_id) { return ResponseEntity.ok(itemRequestService.getAllItemRequestsByReceiver(user_id)); }

    @PostMapping(value = "/joinDoc/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('CREATE_ITEM_REQUEST')")
    public ResponseEntity<StockDocumentResponseDto> joinDoc(@PathVariable Long id, @RequestPart("file") MultipartFile file, @RequestPart("data") @Valid DocumentRequestDto dto) {
        return ResponseEntity.ok(itemRequestService.joinDoc(id, file, dto));
    }
}
