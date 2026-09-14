package ma.project.sgpbse.repository.publicLighting;

import ma.project.sgpbse.entity.publicLighting.Failure;
import ma.project.sgpbse.enums.FailureStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FailureRepository extends JpaRepository<Failure, Long> {
    boolean existsByLightPoint_IdAndFailureStatus(Long lightPointId, FailureStatus failureStatus);
    List<Failure> findAllByFailureStatusOrderByReportDateDesc(FailureStatus failureStatus);
}
