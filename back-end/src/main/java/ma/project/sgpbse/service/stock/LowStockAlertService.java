package ma.project.sgpbse.service.stock;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.project.sgpbse.entity.stock.Item;
import ma.project.sgpbse.entity.stock.LowStockAlert;
import ma.project.sgpbse.repository.stock.LowStockAlertRepository;
import ma.project.sgpbse.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class LowStockAlertService {

    private final LowStockAlertRepository lowStockAlertRepository;
    private final NotificationService notificationService;

    private static final String STOCK_PERMISSION = "READ_STOCK_ALERTS";

    @Transactional
    public void checkAndManageStockAlert(Item item) {

        Optional<LowStockAlert> existingAlert = lowStockAlertRepository.findByItemIdAndResolvedFalse(item.getId());

        // CAS 1 : Le stock est sous le seuil
        if (item.getQuantity() <= item.getAlertThreshold()) {

            // On ne crée une nouvelle alerte que si elle n'existe pas déjà
            if (existingAlert.isEmpty()) {
                String message = String.format("ALERTE STOCK : L'article '%s' (ID: %d) a atteint un niveau critique (%d en stock / seuil min: %d).",
                        item.getName(), item.getId(), item.getQuantity(), item.getAlertThreshold());

                LowStockAlert alert = LowStockAlert.builder()
                        .item(item)
                        .message(message)
                        .createdAt(LocalDate.now())
                        .quantity(item.getQuantity())
                        .build();

                LowStockAlert lowStockAlert = lowStockAlertRepository.save(alert);

                // Notification des utilisateurs habilités
                notificationService.notifyUsersWithPermission(
                        STOCK_PERMISSION,
                        "Alerte Stock Bas",
                        message
                );

                log.warn("Nouvelle alerte de stock bas créée pour l'article ID {}", item.getId());
            }
            else {
                existingAlert.ifPresent(alert -> {
                    alert.setResolved(true);
                    lowStockAlertRepository.save(alert);
                    log.info("Alerte de stock résolue pour l'article ID {}", item.getId());
                });
            }
        }
    }

    //count all low stock alerts
    @Transactional
    public Long countAllLowStockAlerts(){
        return lowStockAlertRepository.count();
    }

    //les alertes récentes(1semaine)
    @Transactional
    public List<LowStockAlert> getLowStockAlertsByPeriod(Long  day_numbers){
        LocalDateTime startDate = LocalDateTime.now().minusDays(day_numbers);
        return lowStockAlertRepository.findAlertsFromDate(startDate);
    }

    //count all alerts
    @Transactional
    public Long countAllAlerts(){
        return lowStockAlertRepository.count();
    }
}
