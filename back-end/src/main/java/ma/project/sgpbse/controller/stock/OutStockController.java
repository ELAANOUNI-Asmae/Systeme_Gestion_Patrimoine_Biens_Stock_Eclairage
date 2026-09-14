package ma.project.sgpbse.controller.stock;

import lombok.AllArgsConstructor;
import ma.project.sgpbse.service.stock.OutStockService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@AllArgsConstructor

@RestController
@RequestMapping("/sgpbse/outStock")
public class OutStockController {

    @Autowired
    private final OutStockService outStockService;

    //count by item and type
    @GetMapping("/count_by_item/{item_id}")
    @PreAuthorize("hasAuthority('COUNT_IN_STOCK_BY_ITEM')")
    public ResponseEntity<Long> countByItem(@PathVariable Long item_id){
        return ResponseEntity.ok(outStockService.countByItem(item_id));
    }

    //count by type
    @GetMapping("/count")
    @PreAuthorize("hasAuthority('COUNT_TOTAL_IN_STOCK')")
    public ResponseEntity<Long> countTotalInStock(){
        return  ResponseEntity.ok(outStockService.countTotalOutStock());
    }

    //count stock mvmnts by period and type
    @GetMapping("/count_by_period")
    @PreAuthorize("hasAuthority('COUNT_IN_STOCK_BY_PERIOD')")
    public ResponseEntity<Long> countTotalInStockByPeriod(@RequestPart(name = "days") Long day_numbers){
        return ResponseEntity.ok(outStockService.countTotalOutStockByPeriod(day_numbers));
    }
}
