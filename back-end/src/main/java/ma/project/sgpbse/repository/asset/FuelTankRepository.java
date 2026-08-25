package ma.project.sgpbse.repository.asset;

import ma.project.sgpbse.entity.asset.FuelTank;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FuelTankRepository extends JpaRepository<FuelTank, Long> {
}
