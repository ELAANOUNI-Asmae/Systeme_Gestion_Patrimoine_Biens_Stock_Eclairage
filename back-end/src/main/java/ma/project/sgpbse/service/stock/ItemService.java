package ma.project.sgpbse.service.stock;


import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import ma.project.sgpbse.dto.stock.request.ItemReqDto;
import ma.project.sgpbse.dto.stock.response.ItemResDto;
import ma.project.sgpbse.entity.asset.Asset;
import ma.project.sgpbse.entity.stock.Item;
import ma.project.sgpbse.entity.stock.ItemStatistics;
import ma.project.sgpbse.entity.stock.StockMovement;
import ma.project.sgpbse.entity.user.User;
import ma.project.sgpbse.exception.stock.ItemAlreadyExistException;
import ma.project.sgpbse.exception.stock.ItemNotExistException;
import ma.project.sgpbse.mapper.stock.ItemMapper;
import ma.project.sgpbse.repository.stock.ItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@AllArgsConstructor

@Service
public class ItemService {

    @Autowired
    private final ItemRepository itemRepository;
    @Autowired
    private final ItemMapper itemMapper;
    @Autowired
    private final LowStockAlertService  lowStockAlertService;

    //ajouter article
    @Transactional
    public ItemResDto createItem(ItemReqDto itemReqDto){

        //1.check if item already exist
        Item item = itemRepository.findBySerialNumber(itemReqDto.getSerialNumber()).get();

        if (item == null){
            throw new ItemAlreadyExistException("Cet article exist déjà !");
        }

        //2.get entity from dto
        item = itemMapper.toEntity(itemReqDto);

        //3.save item
        itemRepository.save(item);

        //4.return result
        return itemMapper.toDto(item);
    }

    //supprimer article
    @Transactional
    public Long deleteItem(Long item_id){

        //1.check if item exist
        Item item = getItemById(item_id);

        //2.delete from db
        itemRepository.deleteById(item_id);

        //3.return result
        return item_id;
    }

    //modifier article
    @Transactional
    public ItemResDto updateItem(Long item_id, ItemReqDto itemReqDto){

        //1.check if item exist
        Item item = getItemById(item_id);

        //2.update entity from dto
        itemMapper.updateItemFromDto(itemReqDto, item);

        //3.save changes
        itemRepository.save(item);
        lowStockAlertService.checkAndManageStockAlert(item);

        //4.return result
        return itemMapper.toDto(item);

    }

    //mettre à jour la quantité
    @Transactional
    public void updateItemQuantity(Long item_id, Long new_quantity){

        //1.check if item exist
        Item item = getItemById(item_id);

        //2.update quantity
        item.setQuantity(new_quantity);

        lowStockAlertService.checkAndManageStockAlert(item);

        //3.save changes
        itemRepository.save(item);
    }

    //get article
    @Transactional
    public ItemResDto getItem(Long item_id){

        //1.check if item exist
        Item item = getItemById(item_id);

        return itemMapper.toDto(item);
    }

    //getall articles
    @Transactional
    public List<ItemResDto> getAllItems(){

        return itemMapper.toDtoList(itemRepository.findAll());
    }

    //chercher article par nr de série
    @Transactional
    public ItemStatistics getItemStatBySerialNumber(Long item_id){

        //1.check if item exist
        Item item = getItemById(item_id);

        //2.return stat
        return new ItemStatistics();
    }

    @Transactional
    public void addItems(Long item_id, Long quantity){
        //1.check if item exist
        Item item = getItemById(item_id);

        //2.update quantity
        item.setQuantity(item.getQuantity() + quantity);

        lowStockAlertService.checkAndManageStockAlert(item);

        //3.save changes
        itemRepository.save(item);
    }

    //get item by item_id
    @Transactional
    public Item getItemById(Long item_id){
        Item item = itemRepository.findById(item_id)
                .orElseThrow(() -> new ItemNotExistException("Cet article n'existe pas !"));

        return item;
    }

    //count all items
    @Transactional
    public Long countAllItems(){
        return itemRepository.count();
    }

    //count total quantities
    @Transactional
    public Long countTotalQuantities(){
        return itemRepository.sumTotalQuantity();
    }

    //search item by serialNumber, name or brand
    @Transactional
    public List<Item> searchItem(String serialNumber, String name, String brand) {
        // Nettoyage des paramètres (vide -> null) pour la requête SQL
        String cleanSerialNumber = (serialNumber != null && !serialNumber.trim().isEmpty()) ? serialNumber.trim() : null;
        String cleanName = (name != null && !name.trim().isEmpty()) ? name.trim() : null;
        String cleanBrand = (brand != null && !brand.trim().isEmpty()) ? brand.trim() : null;

        return itemRepository.searchItems(cleanSerialNumber, cleanName, cleanBrand);
    }

    //get all items with low quantities
    @Transactional
    public List<Item> filterByLowStockStatus(){
        return itemRepository.getItemsWhereQuantityIsLessThanAlertThreshold();
    }

    //get total movment per item
    @Transactional
    public int countTotalMovementPerArticle(Long item_id){
        Item item = getItemById(item_id);
        return item.getStockMovementList().size();
    }

    //add stock movement
    @Transactional
    public void addStockMovement(Long item_id, StockMovement stockMovement){
        Item item = getItemById(item_id);
        item.getStockMovementList().add(stockMovement);
        itemRepository.save(item);
    }

    //remove quantity
    @Transactional
    public void removeQuantity(Long item_id, Long quantity){
        Item item = getItemById(item_id);
        item.setQuantity(item.getQuantity() - quantity);
        itemRepository.save(item);
        lowStockAlertService.checkAndManageStockAlert(item);
    }

}
