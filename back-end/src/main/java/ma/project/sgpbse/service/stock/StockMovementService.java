package ma.project.sgpbse.service.stock;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import ma.project.sgpbse.dto.asset.request.DocumentRequestDto;
import ma.project.sgpbse.dto.stock.request.StockMovementRequestDto;
import ma.project.sgpbse.dto.stock.response.StockDocumentResponseDto;
import ma.project.sgpbse.dto.stock.response.StockMovementResponseDto;
import ma.project.sgpbse.entity.asset.Document;
import ma.project.sgpbse.entity.stock.InStock;
import ma.project.sgpbse.entity.stock.Item;
import ma.project.sgpbse.entity.stock.OutStock;
import ma.project.sgpbse.entity.stock.StockMovement;
import ma.project.sgpbse.repository.stock.StockMovementRepository;
import ma.project.sgpbse.service.asset.DocumentService;
import ma.project.sgpbse.service.user.CurrentUserService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@AllArgsConstructor
public class StockMovementService {
    private final StockMovementRepository stockMovementRepository;
    private final ItemService itemService;
    private final CurrentUserService currentUserService;
    private final DocumentService documentService;

    @Transactional
    public Long countAllStockMovementByPeriod(Long dayNumbers) {
        return stockMovementRepository.countByMouvementDateAfter(LocalDate.now().minusDays(dayNumbers));
    }

    @Transactional
    public List<StockMovementResponseDto> getAll() {
        return stockMovementRepository.findAllByOrderByMouvementDateDescIdDesc().stream().map(this::toDto).toList();
    }

    @Transactional
    public List<StockMovementResponseDto> getByItem(Long itemId) {
        itemService.getItemById(itemId);
        return stockMovementRepository.findByItemIdOrderByMouvementDateDescIdDesc(itemId).stream().map(this::toDto).toList();
    }

    @Transactional
    public StockMovementResponseDto createEntry(Long itemId, StockMovementRequestDto dto) {
        validate(dto);
        if (dto.getUnitPriceHt() == null || dto.getUnitPriceHt() <= 0 || dto.getVatRate() == null || dto.getVatRate() < 0 || dto.getVatRate() > 100) {
            throw new IllegalArgumentException("INVALID_PRICE");
        }
        Item item = itemService.getItemById(itemId);
        InStock movement = new InStock();
        fillCommon(movement, item, dto);
        movement.setUnitEntryPrice(dto.getUnitPriceHt());
        movement.setVat(dto.getVatRate().intValue());
        movement.setSupplierName(clean(dto.getSupplierOrBeneficiary()));
        movement.setOperationRef(clean(dto.getReference()));
        movement.setTotalExcludingTax(dto.getUnitPriceHt() * dto.getQuantity());
        movement.setTotalIncludingTax(movement.getTotalExcludingTax() * (1 + dto.getVatRate() / 100.0));
        movement = stockMovementRepository.save(movement);
        itemService.applyEntry(itemId, dto.getQuantity(), dto.getUnitPriceHt(), dto.getVatRate());
        return toDto(movement);
    }

    @Transactional
    public StockMovementResponseDto createExit(Long itemId, StockMovementRequestDto dto) {
        validate(dto);
        Item item = itemService.getItemById(itemId);
        if (dto.getQuantity() > (item.getQuantity() == null ? 0 : item.getQuantity())) {
            throw new IllegalArgumentException("INSUFFICIENT_STOCK:" + (item.getQuantity() == null ? 0 : item.getQuantity()));
        }
        OutStock movement = new OutStock();
        fillCommon(movement, item, dto);
        movement.setUnitPriceSnapshot(item.getPrice());
        movement.setVatSnapshot(item.getVatRate());
        movement = stockMovementRepository.save(movement);
        itemService.removeQuantity(itemId, dto.getQuantity());
        return toDto(movement);
    }

    @Transactional
    public StockDocumentResponseDto joinDoc(Long movementId, MultipartFile file, DocumentRequestDto dto) {
        StockMovement movement = stockMovementRepository.findById(movementId)
                .orElseThrow(() -> new IllegalArgumentException("MOVEMENT_NOT_FOUND"));
        Document document = documentService.createDocument(dto, file, "GET_ALERT_STOCK_MVMT_OFF_DOCS");
        documentService.addStockMovement(document, movement);
        if (movement.getStockMovementDocuments() == null) movement.setStockMovementDocuments(new ArrayList<>());
        movement.getStockMovementDocuments().add(document);
        return docDto(document);
    }

    private void fillCommon(StockMovement movement, Item item, StockMovementRequestDto dto) {
        movement.setItem(item);
        movement.setQuantity(dto.getQuantity());
        movement.setReason(dto.getReason().trim());
        movement.setMouvementDate(dto.getDate() == null ? LocalDate.now() : dto.getDate());
        movement.setPartnerName(clean(dto.getSupplierOrBeneficiary()));
        movement.setOperationReference(clean(dto.getReference()));
        movement.setPerformedBy(currentUserService.getCurrentUser().getFirstname_fr() + " " + currentUserService.getCurrentUser().getLastname_fr());
        movement.setUnitPriceSnapshot(dto.getUnitPriceHt() != null ? dto.getUnitPriceHt() : item.getPrice());
        movement.setVatSnapshot(dto.getVatRate() != null ? dto.getVatRate() : item.getVatRate());
        movement.setStockMovementDocuments(new ArrayList<>());
    }

    private void validate(StockMovementRequestDto dto) {
        if (dto == null || dto.getQuantity() == null || dto.getQuantity() <= 0) throw new IllegalArgumentException("INVALID_QUANTITY");
        if (dto.getReason() == null || dto.getReason().trim().isEmpty()) throw new IllegalArgumentException("REASON_REQUIRED");
    }

    private StockMovementResponseDto toDto(StockMovement movement) {
        Item item = movement.getItem();
        String type = movement instanceof InStock ? "ENTRY" : "EXIT";
        String partner = movement.getPartnerName();
        String reference = movement.getOperationReference();
        Double price = movement.getUnitPriceSnapshot();
        Double vat = movement.getVatSnapshot();
        if (movement instanceof InStock in) {
            if (partner == null) partner = in.getSupplierName();
            if (reference == null) reference = in.getOperationRef();
            if (price == null) price = in.getUnitEntryPrice();
            if (vat == null) vat = (double) in.getVat();
        }
        return new StockMovementResponseDto(
                movement.getId(), item.getId(), item.getName(), item.getDesignationAr(), type,
                movement.getQuantity(), movement.getReason() == null ? "Mouvement de stock" : movement.getReason(),
                partner, reference, movement.getPerformedBy() == null ? "Agent" : movement.getPerformedBy(),
                movement.getMouvementDate(), price == null ? 0.0 : price, vat == null ? 0.0 : vat,
                movement.getSupplyRequestId(),
                movement.getStockMovementDocuments() == null ? List.of() : movement.getStockMovementDocuments().stream().map(this::docDto).toList());
    }

    private StockDocumentResponseDto docDto(Document d) {
        return new StockDocumentResponseDto(d.getId(), d.getTitle_fr(), d.getTitle_ar(), d.getDocumentType(), d.getType(), d.getPath());
    }

    private String clean(String s) { return s == null || s.trim().isEmpty() ? null : s.trim(); }
}
