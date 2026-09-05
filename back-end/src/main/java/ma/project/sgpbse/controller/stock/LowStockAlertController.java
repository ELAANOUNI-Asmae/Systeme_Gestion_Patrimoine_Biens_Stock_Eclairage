package ma.project.sgpbse.controller.stock;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import ma.project.sgpbse.service.stock.LowStockAlertService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
@AllArgsConstructor

@RestController
@RequestMapping("/sgpbse/lowStockAlert")
public class LowStockAlertController {
    @Autowired
    private final LowStockAlertService lowStockAlertService;


    //count all alerts
    @GetMapping("/total")
    @PreAuthorize("hasAuthority('COUNT_LOW_STOCK_ALERTS')")
    public ResponseEntity<Long> countAllAlerts(){
        return ResponseEntity.ok(lowStockAlertService.countAllAlerts());
    }

}
