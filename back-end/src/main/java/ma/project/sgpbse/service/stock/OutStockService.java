package ma.project.sgpbse.service.stock;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import ma.project.sgpbse.dto.stock.response.OutStockResponseDto;
import ma.project.sgpbse.entity.stock.Item;
import ma.project.sgpbse.entity.stock.ItemRequest;
import ma.project.sgpbse.entity.stock.OutStock;
import ma.project.sgpbse.entity.user.User;
import ma.project.sgpbse.enums.ItemRequestStatus;
import ma.project.sgpbse.mapper.stock.OutStockMapper;
import ma.project.sgpbse.repository.stock.OutStockRepository;
import ma.project.sgpbse.service.user.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@AllArgsConstructor
public class OutStockService {

    @Autowired
    private OutStockRepository outStockRepository;
    @Autowired
    private UserService userService;
    @Autowired
    private ItemService itemService;

    //enregistrer sortie de stock
    @Transactional
    public OutStock saveOutStock(ItemRequest itemRequest, LocalDate requestDate) throws IllegalAccessException {

        if (itemRequest.getStatus() != ItemRequestStatus.APPROVED || !itemRequest.isDelivered()){
            throw new IllegalAccessException("ItemRequest status is invalid");
        }
        //1.get receiver
        User receiver = userService.getUserById(itemRequest.getProviderId());
        OutStock outStock = new OutStock();
        outStock.setReceiver(receiver);
        outStock.setItem(itemRequest.getItem());
        outStock.setQuantity(itemRequest.getQuantity());
        outStock.setMouvementDate(requestDate);

        //save changes
        outStockRepository.save(outStock);

        itemService.removeQuantity(itemRequest.getItem().getId(), itemRequest.getQuantity());

        //add stock movement to user
        userService.addOutStock(receiver, outStock);

        //return result
        return outStock;

    }

    //count by item and type
    @Transactional
    public Long countByItem(Long item_id){
        return  outStockRepository.countByItemId(item_id);
    }

    //count all out stock
    @Transactional
    public Long countTotalOutStock(){
        return outStockRepository.count();
    }

    //count by period
    @Transactional
    public Long countTotalOutStockByPeriod(Long day_numbers){
        LocalDateTime startDate = LocalDateTime.now().minusDays(day_numbers);
        return outStockRepository.countByMouvementDateAfter(startDate);
    }

    //add item
    @Transactional
    public void addItem(Long outStock_id, Item item){
        OutStock outStock = outStockRepository.getOne(outStock_id);
        outStock.setItem(item);
        outStockRepository.save(outStock);
    }
}
