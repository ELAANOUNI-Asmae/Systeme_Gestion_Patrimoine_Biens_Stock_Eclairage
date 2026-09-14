package ma.project.sgpbse.service.stock;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import ma.project.sgpbse.dto.asset.request.DocumentRequestDto;
import ma.project.sgpbse.dto.stock.request.InStockRequestDto;
import ma.project.sgpbse.dto.stock.response.InStockResponseDto;
import ma.project.sgpbse.entity.asset.Document;
import ma.project.sgpbse.entity.stock.InStock;
import ma.project.sgpbse.entity.stock.Item;
import ma.project.sgpbse.entity.user.User;
import ma.project.sgpbse.enums.StockMovementType;
import ma.project.sgpbse.mapper.stock.InStockMapper;
import ma.project.sgpbse.repository.stock.InStockRepository;
import ma.project.sgpbse.service.NotificationService;
import ma.project.sgpbse.service.asset.DocumentService;
import ma.project.sgpbse.service.user.CurrentUserService;
import ma.project.sgpbse.service.user.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@AllArgsConstructor
public class InStockService {

    @Autowired
    private final InStockRepository inStockRepository;
    @Autowired
    private final InStockMapper inStockMapper;
    @Autowired
    private final ItemService itemService;
    @Autowired
    private final DocumentService documentService;
    @Autowired
    private final UserService userService;
    @Autowired
    private final NotificationService  notificationService;
    @Autowired
    private final CurrentUserService currentUserService;

    //enregistrer entréé de stock
    @Transactional
    public InStockResponseDto saveInStock(Long item_id, InStockRequestDto inStockRequestDto, List<MultipartFile> files, List<DocumentRequestDto> documentRequestDtos) {

        //check if item exist
        Item item = itemService.getItemById(item_id);


        //2.get entity from dto
        InStock inStock = inStockMapper.toEntity(inStockRequestDto);
        inStock.setItem(item);
        inStock.setTotalExcludingTax(calculateTotalExcludingTax(
                inStock.getUnitEntryPrice(),
                inStock.getQuantity()
        ));
        inStock.setTotalIncludingTax(
                calculateTotalIncludingTax(
                        inStock.getTotalExcludingTax(),
                        inStock.getVat()
                )
        );

        //3.save stock mvmnt
        inStockRepository.save(inStock);

        // Vérification optionnelle : s'assurer que le nombre de fichiers correspond au nombre de DTOs
        if (files.size() != documentRequestDtos.size()) {
            throw new IllegalArgumentException("Le nombre de fichiers doit correspondre au nombre de données DTO.");
        }

        List<Document> createdDocuments = new ArrayList<>();
        //set target permission
        String targetPermission = "GET_ALERT_STOCK_MVMT_OFF_DOCS";

        // 2. Traitement de chaque document dans la boucle
        for (int i = 0; i < files.size(); i++) {
            MultipartFile file = files.get(i);
            DocumentRequestDto dto = documentRequestDtos.get(i);

            // Création du document (gère aussi le type OFFICIEL et l'échéance)
            Document document = documentService.createDocument(dto, file, targetPermission);

            // Liaison bidirectionnelle
            documentService.addInStock(document, inStock);
            if (inStock.getDocumentList() == null) inStock.setDocumentList(new ArrayList<>());
            inStock.getDocumentList().add(document);

            createdDocuments.add(document);
        }

        //3.add quantities to stock
        itemService.addItems(item_id, inStock.getQuantity());

        //add in stock to item
        itemService.addStockMovement(item_id, inStock);

        // 4. Sauvegarde de l'item mis à jour
        inStockRepository.save(inStock);

        //envoyer notif
        List<User> receivers = userService.filterByPermissionName("GET_INSTOCK_NOTIFICATION");
        User sender = currentUserService.getCurrentUser();
        String title = "Opération d'entrée de stock !";
        String message = String.format("Ajout de %s unité de l'article %s!",
                inStock.getQuantity(),
                item.getName()
        );
        for (User receiver : receivers) {
            notificationService.sendDirectNotification(sender, receiver, title, message);
        }

        return inStockMapper.toDto(inStock);
    }

    //count by item and type
    @Transactional
    public Long countByItem(Long item_id){
        itemService.getItem(item_id);
        return inStockRepository.countByItemId(item_id);
    }

    //count by type
    @Transactional
    public Long countTotalInStock(){
        return inStockRepository.count();
    }

    //count stock mvmnts by period and type
    @Transactional
    public Long countTotalInStockByPeriod(Long day_numbers){
        LocalDate startDate = LocalDate.now().minusDays(day_numbers);
        return inStockRepository.countByMouvementDateAfter(startDate);
    }

    private Double calculateTotalExcludingTax(Double unitPrice, Long quantity){
        if (unitPrice <= 0) {
            throw new IllegalArgumentException("Le prix dois etre diff de 0 !");
        }
        if (quantity <= 0) {
            throw new IllegalArgumentException("Le quantité dois etre diff de 0 !");
        }
        return unitPrice * quantity;
    }

    private Double calculateTotalIncludingTax(Double amount, int vat){
        return amount + amount * (vat / 100.0);
    }
}
