package ma.project.sgpbse.repository.stock;

import ma.project.sgpbse.entity.stock.LowStockAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface LowStockAlertRepository extends JpaRepository<LowStockAlert, Long> {
    @Query("SELECT a FROM LowStockAlert a WHERE a.createdAt >= :startDate AND a.manualRequest = false")
    List<LowStockAlert> findAlertsFromDate(@Param("startDate") LocalDate startDate);
    Optional<LowStockAlert> findByItemIdAndResolvedFalseAndManualRequestFalse(Long itemId);
    List<LowStockAlert> findAllByManualRequestTrueOrderByCreatedAtDescIdDesc();
    long countByResolvedFalseAndManualRequestFalse();
}
