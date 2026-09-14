package ma.project.sgpbse.service.stock;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import ma.project.sgpbse.entity.stock.Item;
import ma.project.sgpbse.entity.stock.ItemRequest;
import ma.project.sgpbse.entity.stock.OutStock;
import ma.project.sgpbse.entity.user.User;
import ma.project.sgpbse.enums.ItemRequestStatus;
import ma.project.sgpbse.repository.stock.OutStockRepository;
import ma.project.sgpbse.service.user.CurrentUserService;
import ma.project.sgpbse.service.user.UserService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@AllArgsConstructor
public class OutStockService {
    private final OutStockRepository outStockRepository;
    private final UserService userService;
    private final ItemService itemService;
    private final CurrentUserService currentUserService;

    @Transactional
    public OutStock saveOutStock(ItemRequest itemRequest, LocalDate requestDate) throws IllegalAccessException {
        if (itemRequest.getStatus() != ItemRequestStatus.APPROVED || !itemRequest.isDelivered()) throw new IllegalAccessException("ItemRequest status is invalid");
        User receiver = userService.getUserById(itemRequest.getProviderId());
        Item item = itemRequest.getItem();
        OutStock out = new OutStock();
        out.setReceiver(receiver);
        out.setItem(item);
        out.setQuantity(itemRequest.getQuantity());
        out.setMouvementDate(requestDate);
        out.setReason("Demande de fourniture #" + itemRequest.getId() + " reçue");
        out.setPartnerName((receiver.getFirstname_fr() + " " + receiver.getLastname_fr()).trim());
        out.setOperationReference("REQ-" + String.format("%04d", itemRequest.getId()));
        out.setPerformedBy((currentUserService.getCurrentUser().getFirstname_fr() + " " + currentUserService.getCurrentUser().getLastname_fr()).trim());
        out.setUnitPriceSnapshot(item.getPrice());
        out.setVatSnapshot(item.getVatRate());
        out.setSupplyRequestId(itemRequest.getId());
        out = outStockRepository.save(out);
        itemService.removeQuantity(item.getId(), itemRequest.getQuantity());
        userService.addOutStock(receiver, out);
        return out;
    }

    @Transactional public Long countByItem(Long itemId) { return outStockRepository.countByItemId(itemId); }
    @Transactional public Long countTotalOutStock() { return outStockRepository.count(); }
    @Transactional public Long countTotalOutStockByPeriod(Long days) { return outStockRepository.countByMouvementDateAfter(LocalDate.now().minusDays(days)); }
    @Transactional public void addItem(Long outId, Item item) { OutStock out = outStockRepository.getReferenceById(outId); out.setItem(item); outStockRepository.save(out); }
}
