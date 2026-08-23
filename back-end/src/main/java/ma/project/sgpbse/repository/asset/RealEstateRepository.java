package ma.project.sgpbse.repository.asset;

import ma.project.sgpbse.entity.asset.RealEstate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RealEstateRepository extends JpaRepository<RealEstate, Long> {
}
