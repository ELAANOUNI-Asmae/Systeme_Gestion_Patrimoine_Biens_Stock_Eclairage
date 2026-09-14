package ma.project.sgpbse.service.stock;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import ma.project.sgpbse.dto.asset.request.DocumentRequestDto;
import ma.project.sgpbse.dto.stock.request.ItemRequestDto;
import ma.project.sgpbse.dto.stock.response.ItemRequestResponseDto;
import ma.project.sgpbse.dto.stock.response.StockDocumentResponseDto;
import ma.project.sgpbse.entity.asset.Document;
import ma.project.sgpbse.entity.stock.Item;
import ma.project.sgpbse.entity.stock.ItemRequest;
import ma.project.sgpbse.entity.user.User;
import ma.project.sgpbse.enums.ItemRequestStatus;
import ma.project.sgpbse.mapper.stock.ItemRequestMapper;
import ma.project.sgpbse.repository.stock.ItemRequestRepository;
import ma.project.sgpbse.service.NotificationService;
import ma.project.sgpbse.service.asset.DocumentService;
import ma.project.sgpbse.service.user.CurrentUserService;
import ma.project.sgpbse.service.user.UserService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@AllArgsConstructor
public class ItemRequestService {
    private final ItemRequestRepository itemRequestRepository;
    private final ItemRequestMapper itemRequestMapper;
    private final ItemService itemService;
    private final UserService userService;
    private final OutStockService outStockService;
    private final NotificationService notificationService;
    private final CurrentUserService currentUserService;
    private final DocumentService documentService;

    @Transactional
    public ItemRequestResponseDto createItemRequest(Long itemId, ItemRequestDto dto) {
        Item item = itemService.getItemById(itemId);
        if (dto.getQuantity() == null || dto.getQuantity() <= 0) throw new IllegalArgumentException("INVALID_QUANTITY");
        long stock = item.getQuantity() == null ? 0 : item.getQuantity();
        if (dto.getQuantity() > stock) throw new IllegalArgumentException("INSUFFICIENT_STOCK:" + stock);
        if (dto.getReason() == null || dto.getReason().trim().isEmpty()) throw new IllegalArgumentException("REASON_REQUIRED");

        User requester = userService.getUserById(dto.getProviderId());
        ItemRequest request = itemRequestMapper.toEntity(dto);
        request.setItem(item);
        request.setStatus(ItemRequestStatus.PENDING);
        request.setDelivered(false);
        request.setRequestDate(dto.getRequestDate() == null ? LocalDate.now() : dto.getRequestDate());
        request.setReason(dto.getReason().trim());
        request.setDocumentList(new ArrayList<>());
        request = itemRequestRepository.save(request);

        String requesterName = name(requester);
        String message = String.format("L'employé %s a besoin de %d unité(s) de l'article %s.", requesterName, request.getQuantity(), item.getName());
        notificationService.notifyUsersWithPermission("APROUVE_ITEM_REQUEST", "Demande d'article", message);
        return toDto(request);
    }

    @Transactional
    public ItemRequestResponseDto cancelItemRequest(Long id) {
        ItemRequest request = getItemRequestById(id);
        User current = currentUserService.getCurrentUser();
        if (!request.getProviderId().equals(current.getId())) throw new IllegalArgumentException("REQUEST_NOT_OWNED");
        if (request.getStatus() != ItemRequestStatus.PENDING) throw new IllegalArgumentException("REQUEST_ALREADY_PROCESSED");
        request.setStatus(ItemRequestStatus.CANCELLED);
        return toDto(itemRequestRepository.save(request));
    }

    @Transactional
    public ItemRequestResponseDto aprouveItemRequest(Long id) {
        ItemRequest request = getItemRequestById(id);
        if (request.getStatus() != ItemRequestStatus.PENDING) throw new IllegalArgumentException("REQUEST_ALREADY_PROCESSED");
        long reserved = itemRequestRepository.findByItemIdAndStatus(request.getItem().getId(), ItemRequestStatus.APPROVED)
                .stream().filter(r -> !r.isDelivered()).mapToLong(ItemRequest::getQuantity).sum();
        long stock = request.getItem().getQuantity() == null ? 0 : request.getItem().getQuantity();
        long available = Math.max(0, stock - reserved);
        if (request.getQuantity() > available) throw new IllegalArgumentException("INSUFFICIENT_STOCK:" + available);
        request.setStatus(ItemRequestStatus.APPROVED);
        request.setDecisionDate(LocalDate.now());
        request = itemRequestRepository.save(request);
        notifyRequester(request, "Demande acceptée", String.format("Votre demande de %d unité(s) de %s a été acceptée.", request.getQuantity(), request.getItem().getName()));
        return toDto(request);
    }

    @Transactional
    public ItemRequestResponseDto rejectItemRequest(Long id, String justif) {
        ItemRequest request = getItemRequestById(id);
        if (request.getStatus() != ItemRequestStatus.PENDING) throw new IllegalArgumentException("REQUEST_ALREADY_PROCESSED");
        String reason = cleanJustification(justif);
        if (reason.isEmpty()) throw new IllegalArgumentException("REJECTION_REASON_REQUIRED");
        request.setStatus(ItemRequestStatus.REJECTED);
        request.setJustif(reason);
        request.setDecisionDate(LocalDate.now());
        request = itemRequestRepository.save(request);
        notifyRequester(request, "Demande refusée", "Votre demande a été refusée. Motif : " + reason);
        return toDto(request);
    }

    @Transactional
    public ItemRequestResponseDto confirmDelivration(Long id) throws IllegalAccessException {
        ItemRequest request = getItemRequestById(id);
        User current = currentUserService.getCurrentUser();
        if (!request.getProviderId().equals(current.getId())) throw new IllegalArgumentException("REQUEST_NOT_OWNED");
        if (request.getStatus() != ItemRequestStatus.APPROVED) throw new IllegalArgumentException("REQUEST_NOT_APPROVED");
        request.setDelivered(true);
        outStockService.saveOutStock(request, LocalDate.now());
        request.setStatus(ItemRequestStatus.ISSUED);
        request.setReceivedAt(LocalDate.now());
        request = itemRequestRepository.save(request);
        notificationService.notifyUsersWithPermission("APROUVE_ITEM_REQUEST", "Réception d'une demande d'article",
                String.format("%s a confirmé la réception de %d unité(s) de %s.", name(current), request.getQuantity(), request.getItem().getName()));
        return toDto(request);
    }

    @Transactional public ItemRequest getItemRequestById(Long id) {
        return itemRequestRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("REQUEST_NOT_FOUND"));
    }
    @Transactional public ItemRequestResponseDto getItemRequest(Long id) { return toDto(getItemRequestById(id)); }
    @Transactional public List<ItemRequestResponseDto> getAllItemRequests() { return itemRequestRepository.findAllByOrderByRequestDateDescIdDesc().stream().map(this::toDto).toList(); }
    @Transactional public Long countItemRequestsByStatus(ItemRequestStatus status) { return itemRequestRepository.countByStatus(status); }
    @Transactional public List<ItemRequestResponseDto> getAllItemRequestsByReceiver(Long userId) { userService.getUserById(userId); return itemRequestRepository.findAllByProviderId(userId).stream().map(this::toDto).toList(); }

    @Transactional
    public StockDocumentResponseDto joinDoc(Long requestId, MultipartFile file, DocumentRequestDto dto) {
        ItemRequest request = getItemRequestById(requestId);
        Document document = documentService.createDocument(dto, file, "GET_ITEM_REQUEST_NOTIFICATION");
        documentService.addItemRequest(document, request);
        if (request.getDocumentList() == null) request.setDocumentList(new ArrayList<>());
        request.getDocumentList().add(document);
        return docDto(document);
    }

    private ItemRequestResponseDto toDto(ItemRequest r) {
        User requester = userService.getUserById(r.getProviderId());
        String status = r.getStatus() == ItemRequestStatus.ISSUED ? "RECEIVED" : r.getStatus().name();
        return new ItemRequestResponseDto(r.getId(), r.getItem().getId(), r.getItem().getName(), r.getItem().getDesignationAr(),
                r.getQuantity(), r.getProviderId(), name(requester), r.getReason() == null ? "" : r.getReason(),
                r.getRequestDate(), status, r.getJustif(), r.getDecisionDate(), r.getReceivedAt(),
                r.getDocumentList() == null ? List.of() : r.getDocumentList().stream().map(this::docDto).toList());
    }

    private StockDocumentResponseDto docDto(Document d) { return new StockDocumentResponseDto(d.getId(), d.getTitle_fr(), d.getTitle_ar(), d.getDocumentType(), d.getType(), d.getPath()); }
    private void notifyRequester(ItemRequest r, String title, String message) { notificationService.sendDirectNotification(currentUserService.getCurrentUser(), userService.getUserById(r.getProviderId()), title, message); }
    private String name(User u) { return ((u.getFirstname_fr() == null ? "" : u.getFirstname_fr()) + " " + (u.getLastname_fr() == null ? "" : u.getLastname_fr())).trim(); }
    private String cleanJustification(String raw) { if (raw == null) return ""; String s = raw.trim(); if (s.startsWith("\"") && s.endsWith("\"") && s.length() >= 2) s = s.substring(1, s.length()-1); return s.trim(); }
}
