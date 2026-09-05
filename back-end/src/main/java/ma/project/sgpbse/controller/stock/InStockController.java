package ma.project.sgpbse.controller.stock;

import lombok.AllArgsConstructor;
import ma.project.sgpbse.dto.asset.request.DocumentRequestDto;
import ma.project.sgpbse.dto.stock.request.InStockRequestDto;
import ma.project.sgpbse.dto.stock.response.InStockResponseDto;
import ma.project.sgpbse.service.stock.InStockService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@AllArgsConstructor

@RestController
@RequestMapping("/sgpbse/inStock")
public class InStockController {

    @Autowired
    private final InStockService inStockService;

    //enregistrer entréé de stock
    @PostMapping("/create/{item_id}")
    @PreAuthorize("hasAuthority('CREATE_IN_STOCK')")
    public ResponseEntity<InStockResponseDto> saveInStock(@PathVariable Long item_id,
                                                          @RequestBody InStockRequestDto inStockRequestDto,
                                                          @RequestPart(name = "files") List<MultipartFile> files,
                                                          @RequestPart(name = "data") List<DocumentRequestDto> documentRequestDtos) {
        return ResponseEntity.ok(inStockService.saveInStock(item_id, inStockRequestDto, files, documentRequestDtos));
    }

    //count by item and type
    @GetMapping("/count_by_item/{item_id}")
    @PreAuthorize("hasAuthority('COUNT_IN_STOCK_BY_ITEM')")
    public ResponseEntity<Long> countByItem(@PathVariable Long item_id){
        return ResponseEntity.ok(inStockService.countByItem(item_id));
    }

    //count by type
    @GetMapping("/count")
    @PreAuthorize("hasAuthority('COUNT_TOTAL_IN_STOCK')")
    public ResponseEntity<Long> countTotalInStock(){
        return  ResponseEntity.ok(inStockService.countTotalInStock());
    }

    //count stock mvmnts by period and type
    @GetMapping("/count_by_period")
    @PreAuthorize("hasAuthority('COUNT_IN_STOCK_BY_PERIOD')")
    public ResponseEntity<Long> countTotalInStockByPeriod(@RequestPart(name = "days") Long day_numbers){
        return ResponseEntity.ok(inStockService.countTotalInStockByPeriod(day_numbers));
    }

}
