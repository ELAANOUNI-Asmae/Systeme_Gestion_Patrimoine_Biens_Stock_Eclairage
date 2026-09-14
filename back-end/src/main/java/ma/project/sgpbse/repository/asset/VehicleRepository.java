package ma.project.sgpbse.repository.asset;

import ma.project.sgpbse.entity.asset.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
}
