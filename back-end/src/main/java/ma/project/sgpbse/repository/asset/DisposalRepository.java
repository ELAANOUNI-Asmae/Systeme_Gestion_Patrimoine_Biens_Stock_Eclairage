package ma.project.sgpbse.repository.asset;

import ma.project.sgpbse.entity.asset.Disposal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DisposalRepository extends JpaRepository<Disposal, Long> {
}
