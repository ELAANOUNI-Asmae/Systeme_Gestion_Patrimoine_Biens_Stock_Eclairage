package ma.project.sgpbse.controller.stock;

import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import ma.project.sgpbse.dto.stock.request.ItemReqDto;
import ma.project.sgpbse.dto.stock.response.ItemResDto;
import ma.project.sgpbse.entity.stock.Item;
import ma.project.sgpbse.entity.stock.ItemStatistics;
import ma.project.sgpbse.service.stock.ItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@AllArgsConstructor

@RestController
@RequestMapping("/sgpbse/item")
public class ItemController {

    @Autowired
    private final ItemService itemService;

    //ajouter article
    @PostMapping("/create")
    @PreAuthorize("hasAuthority('CREATE_ITEM')")
    public ResponseEntity<ItemResDto> createItem(@RequestBody @Valid ItemReqDto itemReqDto){
        return ResponseEntity.ok(itemService.createItem(itemReqDto));
    }

    //supprimer article
    @DeleteMapping("/delete/{item_id}")
    @PreAuthorize("hasAuthority('DELETE_ITEM')")
    public ResponseEntity<Long> deleteItem(@PathVariable Long item_id){
        return ResponseEntity.ok(itemService.deleteItem(item_id));
    }

    //modifier article
    @PutMapping("/update/{item_id}")
    @PreAuthorize("hasAuthority('UPDATE_ITEM')")
    public ResponseEntity<ItemResDto> updateItem(@PathVariable Long item_id, @RequestBody @Valid ItemReqDto itemReqDto){
        return ResponseEntity.ok(itemService.updateItem(item_id, itemReqDto));
    }

    //mettre à jour la quantité
    @PutMapping("/updateQuantity/{item_id}")
    @PreAuthorize("hasAuthority('UPDATE_ITEM_QUANTITY')")
    public void updateItemQuantity(@PathVariable Long item_id, @RequestBody Long new_quantity){
        itemService.updateItemQuantity(item_id, new_quantity);
    }

    //get article
    @GetMapping("/{item_id}")
    @PreAuthorize("hasAuthority('GET_ITEM')")
    public ResponseEntity<ItemResDto> getItem(@PathVariable Long item_id){
        return ResponseEntity.ok(itemService.getItem(item_id));
    }

    //getall articles
    @GetMapping("/all")
    @PreAuthorize("hasAuthority('GET_ALL_ITEMS')")
    public ResponseEntity<List<ItemResDto>> getAllItems(){
        return ResponseEntity.ok(itemService.getAllItems());
    }

    //chercher article par nr de série
    @GetMapping("/stat/{item_id}")
    @PreAuthorize("hasAuthority('GET_ITEM_STAT')")
    public ResponseEntity<ItemStatistics> getItemStatBySerialNumber(@PathVariable Long item_id){
        return ResponseEntity.ok(itemService.getItemStatBySerialNumber(item_id));
    }

    //count all items
    @GetMapping("/total")
    @PreAuthorize("hasAuthority('COUNT_ITEMS')")
    public ResponseEntity<Long> countTotalItems(){
        return ResponseEntity.ok(itemService.countAllItems());
    }

    //get total quantities
    @GetMapping("/total/quantities")
    @PreAuthorize("hasAuthority('COUNT_TOTAL_QUANTITIES')")
    public ResponseEntity<Long> countTotalQuantities(){
        return ResponseEntity.ok(itemService.countTotalQuantities());
    }

    @GetMapping("/search")
    @PreAuthorize("hasAuthority('SEARCH_ITEM')")
    public ResponseEntity<List<Item>> searchItem(
            @RequestParam(value = "serialNumber", required = false) String serialNumber,
            @RequestParam(value = "name", required = false) String name,
            @RequestPart(value = "brand", required = false) String brand
    ) {
        List<Item> results = itemService.searchItem(serialNumber, name, brand);
        return ResponseEntity.ok(results);
    }

    //get all items with low quantities
    @GetMapping("/low")
    @PreAuthorize("hasAuthority('GET_ITEMS_WITH_LOW_STOCK')")
    public ResponseEntity<List<Item>> filterByLowStockStatus(){
        return ResponseEntity.ok(itemService.filterByLowStockStatus());
    }

    //get total movment per item
    @GetMapping("/stock_movement/all/{item_id}")
    @PreAuthorize("hasAuthority('GET_STOCK_MOVEMENT_PER_ITEM')")
    public ResponseEntity<?> countTotalMovementPerArticle(@PathVariable Long item_id){
        return ResponseEntity.ok(itemService.countTotalMovementPerArticle(item_id));
    }

}
