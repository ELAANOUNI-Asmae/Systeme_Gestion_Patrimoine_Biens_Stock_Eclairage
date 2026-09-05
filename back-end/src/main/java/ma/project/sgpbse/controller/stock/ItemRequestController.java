package ma.project.sgpbse.controller.stock;

import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import ma.project.sgpbse.dto.stock.request.ItemRequestDto;
import ma.project.sgpbse.entity.stock.ItemRequest;
import ma.project.sgpbse.entity.user.User;
import ma.project.sgpbse.enums.ItemRequestStatus;
import ma.project.sgpbse.service.stock.ItemRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@AllArgsConstructor

@RestController
@RequestMapping("/sgpbse/itemRequest")
public class ItemRequestController {

    @Autowired
    private final ItemRequestService itemRequestService;

    //demander article
    @PostMapping("/create/{item_id}")
    @PreAuthorize("hasAuthority('CREATE_ITEM_REQUEST')")
    public ResponseEntity<ItemRequest> createItemRequest(@PathVariable Long item_id, @RequestBody @Valid ItemRequestDto itemRequestDto){
        return ResponseEntity.ok(itemRequestService.createItemRequest(item_id, itemRequestDto));
    }

    //annuler la demande
    @PostMapping("/cancel/{itemRequest_id}")
    @PreAuthorize("hasAuthority('CANCEL_ITEM_REQUEST')")
    public ResponseEntity<ItemRequest> cancelItemRequest(@PathVariable Long itemRequest_id){
        return ResponseEntity.ok(itemRequestService.cancelItemRequest(itemRequest_id));
    }

    //accepter la demande
    @PostMapping("/aprouve/{itemRequest_id}")
    @PreAuthorize("hasAuthority('APROUVE_ITEM_REQUEST')")
    public ResponseEntity<ItemRequest> aprouveItemRequest(@PathVariable Long itemRequest_id) throws IllegalAccessException {
        return ResponseEntity.ok(itemRequestService.aprouveItemRequest(itemRequest_id));
    }

    //rejeter la demande
    @PostMapping("/reject/{itemRequest_id}")
    @PreAuthorize("hasAuthority('REJECT_ITEM_REQUEST')")
    public ResponseEntity<ItemRequest> rejectItemRequest(@PathVariable Long itemRequest_id, @RequestBody String justif){
        return  ResponseEntity.ok(itemRequestService.rejectItemRequest(itemRequest_id, justif));
    }

    //get item request
    @GetMapping("/{itemRequest_id}")
    @PreAuthorize("hasAuthority('GET_ITEM_REQUEST')")
    public ResponseEntity<ItemRequest> getItemRequest(@PathVariable Long itemRequest_id){
        return  ResponseEntity.ok(itemRequestService.getItemRequestById(itemRequest_id));
    }

    //get all item requests
    @GetMapping("/all")
    @PreAuthorize("hasAuthority('GET_ALL_ITEM_REQUESTS')")
    public ResponseEntity<List<ItemRequest>> getAllItemRequests(){
        return  ResponseEntity.ok(itemRequestService.getAllItemRequests());
    }

    //count by status
    @GetMapping("/count_by_status")
    @PreAuthorize("hasAuthority('COUNT_ITEM_REQUESTS_BY_STATUS')")
    public ResponseEntity<Long> countItemRequestsByStatus(@RequestBody ItemRequestStatus status){
        return ResponseEntity.ok(itemRequestService.countItemRequestsByStatus(status));
    }

    //confirmer la reception d'une demande
    @PostMapping("/confirm/{itemRequest_id}")
    @PreAuthorize("hasAuthority('CONFIRM_ITEM_REQUEST_DELIVERY')")
    public ResponseEntity<ItemRequest> confirmDelivration(@PathVariable Long itemRequest_id) throws IllegalAccessException {
        return ResponseEntity.ok(itemRequestService.confirmDelivration(itemRequest_id));
    }

    //filter itemRequests by user
    @GetMapping("/filter_by_user/{user_id}")
    @PreAuthorize("hasAuthority('FILTER_ITEM_REQUESTS_BY_USER')")@Transactional
    public ResponseEntity<List<ItemRequest>> getAllItemRequestsByReceiver(@PathVariable Long user_id){
        return ResponseEntity.ok(itemRequestService.getAllItemRequestsByReceiver(user_id));
    }
}
