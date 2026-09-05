package ma.project.sgpbse.repository.publicLighting;

import ma.project.sgpbse.entity.publicLighting.Failure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FailureRepository extends JpaRepository<Failure, Long> {
}
