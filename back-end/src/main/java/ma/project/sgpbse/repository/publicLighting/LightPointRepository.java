package ma.project.sgpbse.repository.publicLighting;

import ma.project.sgpbse.entity.asset.Asset;
import ma.project.sgpbse.entity.publicLighting.LightPoint;
import ma.project.sgpbse.entity.stock.Item;
import ma.project.sgpbse.enums.LightPointStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LightPointRepository extends JpaRepository<LightPoint, Long> {

    Optional<LightPoint> findByLocation(String location);

    long countByLightPointStatus(LightPointStatus lightPointStatus);

    List<LightPoint> findAllByLightPointStatus(LightPointStatus lightPointStatus);

    @Query(value = """
            SELECT * FROM lightPoint lp 
            WHERE (:designation_fr IS NULL OR LOWER(lp.designation_fr) LIKE LOWER(CONCAT('%', :designationFr, '%')))
              AND (:designation_ar IS NULL OR LOWER(lp.designation_ar) LIKE LOWER(CONCAT('%', :designationAr, '%')))
              AND (:location IS NULL OR LOWER(lp.location) LIKE LOWER(CONCAT('%', :location, '%')))
            """, nativeQuery = true)
    List<LightPoint> searchLightPoints(
            @Param("designation_fr") String designationFr,
            @Param("designation_ar") String designationAr,
            @Param("location") String location

    );
}
