package ma.project.sgpbse.service.stock;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import ma.project.sgpbse.dto.asset.request.DocumentRequestDto;
import ma.project.sgpbse.dto.stock.request.ItemReqDto;
import ma.project.sgpbse.dto.stock.response.ItemResDto;
import ma.project.sgpbse.dto.stock.response.StockDocumentResponseDto;
import ma.project.sgpbse.entity.asset.Document;
import ma.project.sgpbse.entity.stock.Item;
import ma.project.sgpbse.entity.stock.ItemStatistics;
import ma.project.sgpbse.entity.stock.StockMovement;
import ma.project.sgpbse.exception.stock.ItemNotExistException;
import ma.project.sgpbse.mapper.stock.ItemMapper;
import ma.project.sgpbse.repository.stock.ItemRepository;
import ma.project.sgpbse.service.asset.DocumentService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@AllArgsConstructor
@Service
public class ItemService {

    private final ItemRepository itemRepository;
    private final ItemMapper itemMapper;
    private final LowStockAlertService lowStockAlertService;
    private final DocumentService documentService;

    @Transactional
    public ItemResDto createItem(ItemReqDto dto) {
        validate(dto);
        assertUnique(dto.getReference(), dto.getSerialNumber(), null);

        Item item = itemMapper.toEntity(dto);
        item.setReference(normalizeReference(dto.getReference()));
        item.setSerialNumber(dto.getSerialNumber().trim());
        item.setQuantity(dto.getQuantity() == null ? 0L : dto.getQuantity());
        item.setUpdatedAt(LocalDate.now());
        item.setItemRequestList(new ArrayList<>());
        item.setStockMovementList(new ArrayList<>());
        item.setLowStockAlertList(new ArrayList<>());
        item.setDocumentList(new ArrayList<>());

        item = itemRepository.save(item);
        lowStockAlertService.checkAndManageStockAlert(item);
        return toDto(item);
    }

    @Transactional
    public Long deleteItem(Long itemId) {
        Item item = getItemById(itemId);
        if (!item.getStockMovementList().isEmpty() || !item.getItemRequestList().isEmpty()) {
            throw new IllegalStateException("ITEM_HAS_HISTORY");
        }
        itemRepository.delete(item);
        return itemId;
    }

    @Transactional
    public ItemResDto updateItem(Long itemId, ItemReqDto dto) {
        validate(dto);
        Item item = getItemById(itemId);
        assertUnique(dto.getReference(), dto.getSerialNumber(), itemId);

        itemMapper.updateItemFromDto(dto, item);
        item.setReference(normalizeReference(dto.getReference()));
        item.setSerialNumber(dto.getSerialNumber().trim());
        item.setQuantity(dto.getQuantity() == null ? item.getQuantity() : dto.getQuantity());
        item.setUpdatedAt(LocalDate.now());

        item = itemRepository.save(item);
        lowStockAlertService.checkAndManageStockAlert(item);
        return toDto(item);
    }

    @Transactional
    public void updateItemQuantity(Long itemId, Long newQuantity) {
        if (newQuantity == null || newQuantity < 0) {
            throw new IllegalArgumentException("INVALID_QUANTITY");
        }
        Item item = getItemById(itemId);
        item.setQuantity(newQuantity);
        item.setUpdatedAt(LocalDate.now());
        itemRepository.save(item);
        lowStockAlertService.checkAndManageStockAlert(item);
    }

    @Transactional
    public ItemResDto getItem(Long itemId) {
        return toDto(getItemById(itemId));
    }

    @Transactional
    public List<ItemResDto> getAllItems() {
        return itemRepository.findAll().stream().map(this::toDto).toList();
    }

    @Transactional
    public ItemStatistics getItemStatBySerialNumber(Long itemId) {
        getItemById(itemId);
        return new ItemStatistics();
    }

    @Transactional
    public void addItems(Long itemId, Long quantity) {
        if (quantity == null || quantity <= 0) throw new IllegalArgumentException("INVALID_QUANTITY");
        Item item = getItemById(itemId);
        item.setQuantity(safeQuantity(item) + quantity);
        item.setUpdatedAt(LocalDate.now());
        itemRepository.save(item);
        lowStockAlertService.checkAndManageStockAlert(item);
    }

    @Transactional
    public void applyEntry(Long itemId, Long quantity, Double price, Double vatRate) {
        if (price == null || price <= 0 || vatRate == null || vatRate < 0 || vatRate > 100) {
            throw new IllegalArgumentException("INVALID_PRICE");
        }
        Item item = getItemById(itemId);
        item.setQuantity(safeQuantity(item) + quantity);
        item.setPrice(price);
        item.setVatRate(vatRate);
        item.setUpdatedAt(LocalDate.now());
        itemRepository.save(item);
        lowStockAlertService.checkAndManageStockAlert(item);
    }

    @Transactional
    public Item getItemById(Long itemId) {
        return itemRepository.findById(itemId)
                .orElseThrow(() -> new ItemNotExistException("Cet article n'existe pas !"));
    }

    @Transactional
    public Long countAllItems() {
        return itemRepository.count();
    }

    @Transactional
    public Long countTotalQuantities() {
        return itemRepository.sumTotalQuantity();
    }

    @Transactional
    public List<ItemResDto> searchItem(String serialNumber, String name, String brand) {
        String s = clean(serialNumber);
        String n = clean(name);
        String b = clean(brand);

        return itemRepository.findAll().stream()
                .filter(item -> s == null || containsIgnoreCase(item.getSerialNumber(), s))
                .filter(item -> n == null || containsIgnoreCase(item.getName(), n))
                .filter(item -> b == null || containsIgnoreCase(item.getBrand(), b))
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public List<ItemResDto> filterByLowStockStatus() {
        return itemRepository.getItemsWhereQuantityIsLessThanAlertThreshold().stream().map(this::toDto).toList();
    }

    @Transactional
    public int countTotalMovementPerArticle(Long itemId) {
        return getItemById(itemId).getStockMovementList().size();
    }

    @Transactional
    public void addStockMovement(Long itemId, StockMovement stockMovement) {
        Item item = getItemById(itemId);
        if (item.getStockMovementList() == null) item.setStockMovementList(new ArrayList<>());
        item.getStockMovementList().add(stockMovement);
        itemRepository.save(item);
    }

    @Transactional
    public void removeQuantity(Long itemId, Long quantity) {
        if (quantity == null || quantity <= 0) throw new IllegalArgumentException("INVALID_QUANTITY");
        Item item = getItemById(itemId);
        long current = safeQuantity(item);
        if (quantity > current) throw new IllegalArgumentException("INSUFFICIENT_STOCK:" + current);
        item.setQuantity(current - quantity);
        item.setUpdatedAt(LocalDate.now());
        itemRepository.save(item);
        lowStockAlertService.checkAndManageStockAlert(item);
    }

    @Transactional
    public StockDocumentResponseDto joinDoc(Long itemId, MultipartFile file, DocumentRequestDto dto) {
        Item item = getItemById(itemId);
        Document document = documentService.createDocument(dto, file, "GET_ALERT_STOCK_MVMT_OFF_DOCS");
        documentService.addItem(document, item);
        if (item.getDocumentList() == null) item.setDocumentList(new ArrayList<>());
        item.getDocumentList().add(document);
        return documentDto(document);
    }

    @Transactional
    public void deleteDocument(Long itemId, Long documentId) {
        Item item = getItemById(itemId);
        boolean belongs = item.getDocumentList() != null && item.getDocumentList().stream()
                .anyMatch(d -> d.getId().equals(documentId));
        if (!belongs) throw new IllegalArgumentException("DOCUMENT_NOT_LINKED_TO_ITEM");
        item.getDocumentList().removeIf(d -> d.getId().equals(documentId));
        documentService.deleteDocument(documentId);
    }

    private ItemResDto toDto(Item item) {
        ItemResDto dto = itemMapper.toDto(item);
        dto.setDocuments(item.getDocumentList() == null
                ? List.of()
                : item.getDocumentList().stream().map(this::documentDto).toList());
        return dto;
    }

    private StockDocumentResponseDto documentDto(Document d) {
        return new StockDocumentResponseDto(
                d.getId(), d.getTitle_fr(), d.getTitle_ar(), d.getDocumentType(), d.getType(), d.getPath());
    }

    private void validate(ItemReqDto dto) {
        if (dto == null) throw new IllegalArgumentException("ITEM_REQUIRED");
        if (clean(dto.getReference()) == null) throw new IllegalArgumentException("REFERENCE_REQUIRED");
        if (clean(dto.getSerialNumber()) == null) throw new IllegalArgumentException("BARCODE_REQUIRED");
        if (clean(dto.getBrand()) == null) throw new IllegalArgumentException("BRAND_REQUIRED");
        if (clean(dto.getName()) == null) throw new IllegalArgumentException("DESIGNATION_REQUIRED");
        if (dto.getQuantity() != null && dto.getQuantity() < 0) throw new IllegalArgumentException("INVALID_QUANTITY");
        if (dto.getAlertThreshold() == null || dto.getAlertThreshold() < 0) throw new IllegalArgumentException("INVALID_QUANTITY");
        if (dto.getPrice() == null || dto.getPrice() <= 0 || dto.getVatRate() == null || dto.getVatRate() < 0 || dto.getVatRate() > 100) {
            throw new IllegalArgumentException("INVALID_PRICE");
        }
    }

    private void assertUnique(String reference, String serialNumber, Long exceptId) {
        itemRepository.findByReferenceIgnoreCase(normalizeReference(reference)).ifPresent(existing -> {
            if (exceptId == null || !existing.getId().equals(exceptId)) throw new IllegalArgumentException("REFERENCE_ALREADY_USED");
        });
        itemRepository.findBySerialNumber(serialNumber.trim()).ifPresent(existing -> {
            if (exceptId == null || !existing.getId().equals(exceptId)) throw new IllegalArgumentException("BARCODE_ALREADY_USED");
        });
    }

    private String normalizeReference(String value) { return value.trim().toUpperCase(); }
    private String clean(String value) { return value == null || value.trim().isEmpty() ? null : value.trim(); }

    private boolean containsIgnoreCase(String value, String query) {
        return value != null && value.toLowerCase(java.util.Locale.ROOT)
                .contains(query.toLowerCase(java.util.Locale.ROOT));
    }

    private long safeQuantity(Item item) { return item.getQuantity() == null ? 0L : item.getQuantity(); }
}
