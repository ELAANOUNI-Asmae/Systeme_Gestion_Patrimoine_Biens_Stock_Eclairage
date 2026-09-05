package ma.project.sgpbse.repository.stock;

import ma.project.sgpbse.entity.stock.InStock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface InStockRepository extends JpaRepository<InStock, Long> {

    //count by item type
    @Query("""
        SELECT COUNT(is) FROM InStock is WHERE is.item.id = :itemId
        """)
    long countByItemId(
            @Param("itemId") Long itemId
    );

    //count by period
    long countByMouvementDateAfter(LocalDateTime mouvementDate);}
