package ma.project.sgpbse.repository.stock;

import ma.project.sgpbse.entity.stock.LowStockAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface LowStockAlertRepository extends JpaRepository<LowStockAlert, Long> {

    @Query("SELECT a FROM LowStockAlert a WHERE a.createdAt >= :startDate")
    List<LowStockAlert> findAlertsFromDate(@Param("startDate") LocalDateTime startDate);

    Optional<LowStockAlert> findByItemIdAndResolvedFalse(Long itemId);
}
