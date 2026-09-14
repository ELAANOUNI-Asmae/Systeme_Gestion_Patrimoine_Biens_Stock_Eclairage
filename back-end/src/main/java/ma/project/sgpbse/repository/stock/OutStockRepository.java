package ma.project.sgpbse.repository.stock;

import ma.project.sgpbse.entity.stock.OutStock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

@Repository
public interface OutStockRepository extends JpaRepository<OutStock, Long> {
    @Query("SELECT COUNT(os) FROM OutStock os WHERE os.item.id = :itemId")
    long countByItemId(@Param("itemId") Long itemId);
    long countByMouvementDateAfter(LocalDate mouvementDate);
}
