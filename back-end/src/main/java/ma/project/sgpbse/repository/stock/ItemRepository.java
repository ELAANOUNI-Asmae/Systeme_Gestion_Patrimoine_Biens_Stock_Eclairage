package ma.project.sgpbse.repository.stock;

import ma.project.sgpbse.entity.stock.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {

    Optional<Item> findBySerialNumber(String serialNumber);
    Optional<Item> findByReferenceIgnoreCase(String reference);

    @Query("SELECT COALESCE(SUM(i.quantity), 0) FROM Item i")
    Long sumTotalQuantity();

    @Query("""
        SELECT i FROM Item i
        WHERE (:serialNumber IS NULL OR LOWER(i.serialNumber) LIKE LOWER(CONCAT('%', :serialNumber, '%')))
          AND (:name IS NULL OR LOWER(i.name) LIKE LOWER(CONCAT('%', :name, '%')))
          AND (:brand IS NULL OR LOWER(i.brand) LIKE LOWER(CONCAT('%', :brand, '%')))
        """)
    List<Item> searchItems(
            @Param("serialNumber") String serialNumber,
            @Param("name") String name,
            @Param("brand") String brand
    );

    @Query("SELECT i FROM Item i WHERE COALESCE(i.quantity, 0) <= COALESCE(i.alertThreshold, 0)")
    List<Item> getItemsWhereQuantityIsLessThanAlertThreshold();
}
