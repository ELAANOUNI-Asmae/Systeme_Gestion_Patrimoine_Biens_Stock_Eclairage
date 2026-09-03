package ma.project.sgpbse.repository.asset;

import ma.project.sgpbse.entity.asset.Asset;
import ma.project.sgpbse.enums.AssetStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AssetRepository extends JpaRepository<Asset, Long> {
    long countByAssetStatus(AssetStatus status);

    // REMPLACEZ ICI
    @Query("SELECT a FROM Asset a WHERE " +
            "LOWER(a.designation) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(a.inventory_id) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Asset> searchGlobally(@Param("keyword") String keyword, Pageable pageable);

    List<Asset> findAllByAssetStatus(AssetStatus status);

    @Query("SELECT a FROM Asset a WHERE TYPE(a) IN (SELECT sub FROM Asset sub WHERE TYPE(sub) = :discriminatorValue)")
    List<Asset> findByDiscriminatorValue(@Param("discriminatorValue") String discriminatorValue);

    @Query(value = "SELECT * FROM asset WHERE status = 'ARCHIVED'", nativeQuery = true)
    List<Asset> findAllArchivedAssets();

    @Query(value = """
            SELECT * FROM asset a 
            WHERE a.status = 'ARCHIVED'
              AND (:designation IS NULL OR LOWER(a.designation) LIKE LOWER(CONCAT('%', :designation, '%')))
              AND (:inventoryId IS NULL OR LOWER(a.inventory_id) LIKE LOWER(CONCAT('%', :inventoryId, '%')))
            """, nativeQuery = true)
    List<Asset> searchArchivedAssets(
            @Param("designation") String designation,
            @Param("inventoryId") String inventoryId
    );

}