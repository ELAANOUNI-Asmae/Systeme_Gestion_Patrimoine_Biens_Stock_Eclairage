package ma.project.sgpbse.repository.stock;

import ma.project.sgpbse.entity.stock.InStock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

@Repository
public interface InStockRepository extends JpaRepository<InStock, Long> {
    @Query("SELECT COUNT(i) FROM InStock i WHERE i.item.id = :itemId")
    long countByItemId(@Param("itemId") Long itemId);
    long countByMouvementDateAfter(LocalDate mouvementDate);
}
