package ma.project.sgpbse.service.stock;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import ma.project.sgpbse.dto.stock.request.ItemRequestDto;
import ma.project.sgpbse.entity.stock.Item;
import ma.project.sgpbse.entity.stock.ItemRequest;
import ma.project.sgpbse.entity.stock.OutStock;
import ma.project.sgpbse.entity.user.User;
import ma.project.sgpbse.enums.ItemRequestStatus;
import ma.project.sgpbse.mapper.stock.ItemRequestMapper;
import ma.project.sgpbse.repository.stock.ItemRequestRepository;
import ma.project.sgpbse.service.NotificationService;
import ma.project.sgpbse.service.user.CurrentUserService;
import ma.project.sgpbse.service.user.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@AllArgsConstructor
public class ItemRequestService {

    @Autowired
    private final ItemRequestRepository itemRequestRepository;
    @Autowired
    private final ItemRequestMapper itemRequestMapper;
    @Autowired
    private final ItemService itemService;
    @Autowired
    private final UserService  userService;
    @Autowired
    private final OutStockService outStockService;
    @Autowired
    private final NotificationService notificationService;
    @Autowired
    private final CurrentUserService currentUserService;


    //demander article
    @Transactional
    public ItemRequest createItemRequest(Long item_id, ItemRequestDto itemRequestDto){

        //1.check if item exist
        Item item = itemService.getItemById(item_id);

        //2.check if receiver exist
        User provider = userService.getUserById(itemRequestDto.getProviderId());

        List<User> receivers = userService.filterByPermissionName("GET_ITEM_REQUEST_NOTIFICATION");

        //2.check margin
        Long margin = item.getQuantity() - itemRequestDto.getQuantity();
        if (margin < 0){

            //envoyer une alerte au reponsable stock
            String title = "Demande d'article dépasse le stock";
            String message = String.format("L'employé %s a besoin de % unité de l'article %s, il faut ajouter des unité de cet cette article!",
                        provider.getFirstname_fr() + provider.getLastname_fr(),
                        itemRequestDto.getQuantity(),
                        item.getName()
                    );
            for (User receiver : receivers) {
                notificationService.sendDirectNotification(provider, receiver, title, message);
            }
            throw new IllegalArgumentException("Le stock est insufisant !");
        }

        //3.get entity from dto
        ItemRequest itemRequest = itemRequestMapper.toEntity(itemRequestDto);
        itemRequest.setItem(item);
        itemRequest.setStatus(ItemRequestStatus.PENDING);

        //envoyer une notif au resp au stock
        //envoyer notif
        String title = "Demande d'article";
        String message = String.format("L'employé %s a besoin de % unité de l'article %s!",
                itemRequest.getQuantity(),
                item.getName()
        );
        for (User receiver : receivers) {
            notificationService.sendDirectNotification(provider, receiver, title, message);
        }

        //4.save changes
        return itemRequestRepository.save(itemRequest);
    }

    //annuler la demande
    @Transactional
    public ItemRequest cancelItemRequest(Long itemRequest_id){

        //1.check if itemrequest exist
        ItemRequest itemRequest = getItemRequestById(itemRequest_id);

        //check item request status
        if (itemRequest.getStatus() != ItemRequestStatus.PENDING){
            throw new IllegalArgumentException("La demande est déjà vérifié !");
        }

        //2.update status
        itemRequest.setStatus(ItemRequestStatus.CANCELLED);

        //envoyer une notification au chef de stock
        List<User> receivers = userService.filterByPermissionName("GET_ITEM_REQUEST_NOTIFICATION");
        User sender = currentUserService.getCurrentUser();
        String title = "Annulation d'une deemande d'article";
        String message = String.format("L'employé %s a annulé sa demande de l'article %s!",
                sender.getFirstname_fr() + sender.getLastname_fr(),
                itemRequest.getItem().getName()
        );
        for (User receiver : receivers) {
            notificationService.sendDirectNotification(sender, receiver, title, message);
        }

        //3.save changes
        return itemRequestRepository.save(itemRequest);
    }

    //accepter la demande
    @Transactional
    public ItemRequest aprouveItemRequest(Long itemRequest_id) throws IllegalAccessException {

        //1.check if itemrequest exist
        ItemRequest itemRequest = getItemRequestById(itemRequest_id);

        //check item request status
        if (itemRequest.getStatus() != ItemRequestStatus.PENDING){
            throw new IllegalArgumentException("La demande est déjà vérifié !");
        }

        //2.update status
        itemRequest.setStatus(ItemRequestStatus.APPROVED);

        //get receiver
        User receiver = userService.getUserById(itemRequest.getProviderId());

        //envoyer une notification au demandeur
        User sender = currentUserService.getCurrentUser();
        String title = "Demande accepté";
        String message = String.format("Votre demande de %s unités d'article %s a été accepté!",
                itemRequest.getQuantity(),
                itemRequest.getItem().getName()
        );
        notificationService.sendDirectNotification(sender, receiver, title, message);

        //3.save changes
        return itemRequestRepository.save(itemRequest);
    }

    //rejeter la demande
    @Transactional
    public ItemRequest rejectItemRequest(Long itemRequest_id, String justif){

        //1.check if itemrequest exist
        ItemRequest itemRequest = getItemRequestById(itemRequest_id);

        //check item request status
        if (itemRequest.getStatus() != ItemRequestStatus.PENDING){
            throw new IllegalArgumentException("La demande est déjà vérifié !");
        }

        //2.update status
        itemRequest.setStatus(ItemRequestStatus.REJECTED);
        itemRequest.setJustif(justif);

        //get receiver
        User receiver = userService.getUserById(itemRequest.getProviderId());

        //envoyer une notification au demandeur
        User sender = currentUserService.getCurrentUser();
        String title = "Demande refusé !";
        String message = String.format("Votre demande de %s unités d'article %s a été refusé! \n Justif : %s",
                itemRequest.getQuantity(),
                itemRequest.getItem().getName(),
                itemRequest.getJustif()
        );
        notificationService.sendDirectNotification(sender, receiver, title, message);

        //3.save changes
        return itemRequestRepository.save(itemRequest);


    }

    //confirmer la reception d'une demande
    @Transactional
    public ItemRequest confirmDelivration(Long itemRequest_id) throws IllegalAccessException {

        //1.check if request exist
        ItemRequest itemRequest = getItemRequestById(itemRequest_id);

        //2.check item request status
        if (itemRequest.getStatus() != ItemRequestStatus.APPROVED){
            throw new IllegalArgumentException("La demande dois etre accepté au début !");
        }

        //3.deliver request
        itemRequest.setDelivered(true);

        //envoyer une notification au chef de stock
        List<User> receivers = userService.filterByPermissionName("GET_ITEM_REQUEST_NOTIFICATION");
        User sender = currentUserService.getCurrentUser();
        String title = "Reception d'une demande d'article";
        String message = String.format("L'employé %s a bien reçu sa demande de %s unité de l'article %s!",
                sender.getFirstname_fr() + sender.getLastname_fr(),
                itemRequest.getQuantity(),
                itemRequest.getItem().getName()
        );
        for (User receiver : receivers) {
            notificationService.sendDirectNotification(sender, receiver, title, message);
        }

        //save out of stock
        OutStock out = outStockService.saveOutStock(itemRequest,LocalDate.now());

        //add out stock movement to item
        itemService.addStockMovement(itemRequest.getItem().getId(), out);

        //add out itemRequest to Stock movement
        outStockService.addItem(out.getId(), itemRequest.getItem());

        //4.save changes
        return itemRequestRepository.save(itemRequest);
    }

    //get item request by id
    @Transactional
    public ItemRequest getItemRequestById(Long itemRequest_id){
        ItemRequest itemRequest = itemRequestRepository.findById(itemRequest_id)
                .orElseThrow(() -> new  IllegalArgumentException("Demande non trouvé!"));

        return itemRequest;
    }

    //get all item requests
    @Transactional
    public List<ItemRequest> getAllItemRequests(){
        return itemRequestRepository.findAll();
    }

    //count by status
    @Transactional
    public Long countItemRequestsByStatus(ItemRequestStatus status){
        return itemRequestRepository.countByStatus(status);
    }

    //filter itemRequests by user
    @Transactional
    public List<ItemRequest> getAllItemRequestsByReceiver(Long user_id){

        User receiver = userService.getUserById(user_id);
        return itemRequestRepository.findAllByProviderId(user_id);
    }


}
