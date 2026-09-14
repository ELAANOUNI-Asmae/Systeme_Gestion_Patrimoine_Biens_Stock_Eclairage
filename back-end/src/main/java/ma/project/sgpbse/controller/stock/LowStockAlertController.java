package ma.project.sgpbse.controller.stock;

import lombok.AllArgsConstructor;
import ma.project.sgpbse.dto.stock.request.RestockAlertRequestDto;
import ma.project.sgpbse.dto.stock.response.RestockAlertResponseDto;
import ma.project.sgpbse.service.stock.ItemService;
import ma.project.sgpbse.service.stock.LowStockAlertService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@AllArgsConstructor
@RestController
@RequestMapping("/sgpbse/lowStockAlert")
public class LowStockAlertController {
    private final LowStockAlertService lowStockAlertService;
    private final ItemService itemService;

    @GetMapping("/total")
    @PreAuthorize("hasAuthority('COUNT_LOW_STOCK_ALERTS')")
    public ResponseEntity<Long> countAllAlerts() { return ResponseEntity.ok(lowStockAlertService.countAllAlerts()); }

    @GetMapping("/restock/all")
    @PreAuthorize("hasAnyAuthority('APROUVE_ITEM_REQUEST','CREATE_ITEM_REQUEST')")
    public ResponseEntity<List<RestockAlertResponseDto>> allRestock() { return ResponseEntity.ok(lowStockAlertService.getRestockRequests()); }

    @PostMapping("/restock/create/{item_id}")
    @PreAuthorize("hasAuthority('CREATE_ITEM_REQUEST')")
    public ResponseEntity<RestockAlertResponseDto> createRestock(@PathVariable Long item_id, @RequestBody RestockAlertRequestDto dto) {
        return ResponseEntity.ok(lowStockAlertService.createRestockRequest(itemService.getItemById(item_id), dto));
    }

    @PostMapping("/restock/ready/{id}")
    @PreAuthorize("hasAuthority('APROUVE_ITEM_REQUEST')")
    public ResponseEntity<RestockAlertResponseDto> ready(@PathVariable Long id) { return ResponseEntity.ok(lowStockAlertService.markRestockReady(id)); }
}
