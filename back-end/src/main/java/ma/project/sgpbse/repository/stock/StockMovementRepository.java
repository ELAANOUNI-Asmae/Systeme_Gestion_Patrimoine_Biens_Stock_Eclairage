package ma.project.sgpbse.repository.stock;

import ma.project.sgpbse.entity.stock.StockMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {
    long countByMouvementDateAfter(LocalDate mouvementDate);
    List<StockMovement> findAllByOrderByMouvementDateDescIdDesc();
    List<StockMovement> findByItemIdOrderByMouvementDateDescIdDesc(Long itemId);
}
