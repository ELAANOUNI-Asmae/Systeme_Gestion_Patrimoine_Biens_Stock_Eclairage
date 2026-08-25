package ma.project.sgpbse.repository.asset;

import ma.project.sgpbse.entity.asset.Machine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MachineRepository extends JpaRepository<Machine, Long> {
}
