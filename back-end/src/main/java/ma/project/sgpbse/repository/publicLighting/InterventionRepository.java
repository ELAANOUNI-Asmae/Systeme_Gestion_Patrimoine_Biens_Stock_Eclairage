package ma.project.sgpbse.repository.publicLighting;

import ma.project.sgpbse.entity.publicLighting.Intervention;
import ma.project.sgpbse.enums.InterventionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InterventionRepository extends JpaRepository<Intervention, Long> {
    long countAllByStatus(InterventionStatus status);
}
