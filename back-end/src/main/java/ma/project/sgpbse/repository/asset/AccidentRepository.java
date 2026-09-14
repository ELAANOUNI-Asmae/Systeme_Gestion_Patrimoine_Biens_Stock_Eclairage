package ma.project.sgpbse.repository.asset;

import ma.project.sgpbse.entity.asset.Accident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AccidentRepository extends JpaRepository<Accident, Long> {
}
