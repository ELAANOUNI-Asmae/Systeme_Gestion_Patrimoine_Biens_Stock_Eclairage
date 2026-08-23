package ma.project.sgpbse.repository.asset;

import ma.project.sgpbse.entity.asset.Asset;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AssetRepository extends JpaRepository<Asset, Long> {
}
