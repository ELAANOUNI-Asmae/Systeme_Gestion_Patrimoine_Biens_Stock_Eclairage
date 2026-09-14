package ma.project.sgpbse.service.stock;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.project.sgpbse.dto.stock.request.RestockAlertRequestDto;
import ma.project.sgpbse.dto.stock.response.RestockAlertResponseDto;
import ma.project.sgpbse.entity.stock.Item;
import ma.project.sgpbse.entity.stock.LowStockAlert;
import ma.project.sgpbse.entity.user.User;
import ma.project.sgpbse.repository.stock.LowStockAlertRepository;
import ma.project.sgpbse.service.NotificationService;
import ma.project.sgpbse.service.user.CurrentUserService;
import ma.project.sgpbse.service.user.UserService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class LowStockAlertService {
    private final LowStockAlertRepository lowStockAlertRepository;
    private final NotificationService notificationService;
    private final CurrentUserService currentUserService;
    private final UserService userService;
    private static final String STOCK_PERMISSION = "READ_STOCK_ALERTS";

    @Transactional
    public void checkAndManageStockAlert(Item item) {
        long quantity = item.getQuantity() == null ? 0 : item.getQuantity();
        long threshold = item.getAlertThreshold() == null ? 0 : item.getAlertThreshold();
        Optional<LowStockAlert> existing = lowStockAlertRepository.findByItemIdAndResolvedFalseAndManualRequestFalse(item.getId());

        if (quantity <= threshold) {
            String message = String.format("ALERTE STOCK : L'article '%s' a atteint un niveau critique (%d en stock / seuil min: %d).", item.getName(), quantity, threshold);
            if (existing.isEmpty()) {
                LowStockAlert alert = LowStockAlert.builder().item(item).resolved(false).manualRequest(false)
                        .message(message).createdAt(LocalDate.now()).quantity(quantity).build();
                lowStockAlertRepository.save(alert);
                notificationService.notifyUsersWithPermission(STOCK_PERMISSION, "Alerte Stock Bas", message);
            } else {
                LowStockAlert alert = existing.get();
                alert.setQuantity(quantity);
                alert.setMessage(message);
                lowStockAlertRepository.save(alert);
            }
        } else if (existing.isPresent()) {
            LowStockAlert alert = existing.get();
            alert.setResolved(true);
            lowStockAlertRepository.save(alert);
        }
    }

    @Transactional
    public RestockAlertResponseDto createRestockRequest(Item item, RestockAlertRequestDto dto) {
        if (dto == null || dto.getRequestedQuantity() == null || dto.getRequestedQuantity() <= 0) throw new IllegalArgumentException("INVALID_RESTOCK_ALERT");
        long stock = item.getQuantity() == null ? 0 : item.getQuantity();
        if (dto.getRequestedQuantity() <= stock) throw new IllegalArgumentException("STOCK_ALREADY_AVAILABLE");
        if (dto.getReason() == null || dto.getReason().trim().isEmpty()) throw new IllegalArgumentException("INVALID_RESTOCK_ALERT");
        User user = currentUserService.getCurrentUser();
        String requester = name(user);
        LowStockAlert alert = LowStockAlert.builder().item(item).resolved(false).manualRequest(true)
                .quantity(stock).requestedQuantity(dto.getRequestedQuantity()).requesterId(user.getId()).requesterName(requester)
                .reason(dto.getReason().trim()).createdAt(LocalDate.now())
                .message(requester + " a besoin de " + dto.getRequestedQuantity() + " unité(s) de " + item.getName() + ".").build();
        alert = lowStockAlertRepository.save(alert);
        notificationService.notifyUsersWithPermission("APROUVE_ITEM_REQUEST", "Réapprovisionnement nécessaire", alert.getMessage());
        return toDto(alert);
    }

    @Transactional
    public RestockAlertResponseDto markRestockReady(Long id) {
        LowStockAlert alert = lowStockAlertRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("RESTOCK_ALERT_NOT_FOUND"));
        if (!alert.isManualRequest()) throw new IllegalArgumentException("RESTOCK_ALERT_NOT_FOUND");
        long stock = alert.getItem().getQuantity() == null ? 0 : alert.getItem().getQuantity();
        if (stock < alert.getRequestedQuantity()) throw new IllegalArgumentException("INSUFFICIENT_STOCK:" + stock);
        alert.setReadyNotifiedAt(LocalDate.now());
        alert.setResolved(true);
        alert = lowStockAlertRepository.save(alert);
        User sender = currentUserService.getCurrentUser();
        User receiver = userService.getUserById(alert.getRequesterId());
        notificationService.sendDirectNotification(sender, receiver, "Quantité disponible",
                alert.getRequestedQuantity() + " unité(s) de " + alert.getItem().getName() + " sont maintenant disponibles.");
        return toDto(alert);
    }

    @Transactional public List<RestockAlertResponseDto> getRestockRequests() { return lowStockAlertRepository.findAllByManualRequestTrueOrderByCreatedAtDescIdDesc().stream().map(this::toDto).toList(); }
    @Transactional public Long countAllLowStockAlerts() { return lowStockAlertRepository.countByResolvedFalseAndManualRequestFalse(); }
    @Transactional public List<LowStockAlert> getLowStockAlertsByPeriod(Long days) { return lowStockAlertRepository.findAlertsFromDate(LocalDate.now().minusDays(days)); }
    @Transactional public Long countAllAlerts() { return lowStockAlertRepository.countByResolvedFalseAndManualRequestFalse(); }

    private RestockAlertResponseDto toDto(LowStockAlert a) {
        return new RestockAlertResponseDto(a.getId(), a.getItem().getId(), a.getItem().getName(), a.getItem().getDesignationAr(),
                a.getRequestedQuantity(), a.getQuantity(), a.getRequesterId(), a.getRequesterName(), a.getReason(), a.getCreatedAt(),
                a.getReadyNotifiedAt() == null ? "WAITING" : "READY_NOTIFIED", a.getReadyNotifiedAt());
    }
    private String name(User u) { return ((u.getFirstname_fr() == null ? "" : u.getFirstname_fr()) + " " + (u.getLastname_fr() == null ? "" : u.getLastname_fr())).trim(); }
}
