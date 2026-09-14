package ma.project.sgpbse.repository.publicLighting;

import ma.project.sgpbse.entity.publicLighting.LightPoint;
import ma.project.sgpbse.enums.LightPointStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LightPointRepository extends JpaRepository<LightPoint, Long> {
    Optional<LightPoint> findByLocation(String location);
    Optional<LightPoint> findByReferenceIgnoreCase(String reference);
    long countByLightPointStatus(LightPointStatus lightPointStatus);
    List<LightPoint> findAllByLightPointStatus(LightPointStatus lightPointStatus);
}
