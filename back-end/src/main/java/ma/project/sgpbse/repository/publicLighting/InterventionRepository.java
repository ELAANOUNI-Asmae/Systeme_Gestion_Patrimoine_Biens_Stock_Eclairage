package ma.project.sgpbse.repository.publicLighting;

import ma.project.sgpbse.entity.publicLighting.Intervention;
import ma.project.sgpbse.entity.user.User;
import ma.project.sgpbse.enums.InterventionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterventionRepository extends JpaRepository<Intervention, Long> {

    long countAllByStatus(InterventionStatus status);
    @Query(value = """
            SELECT * FROM intervention in 
            WHERE (:description IS NULL OR LOWER(in.description) LIKE LOWER(CONCAT('%', :description, '%')))
              AND (:technician IS NULL OR LOWER(in.technician) LIKE LOWER(CONCAT('%', :technician, '%')))
            """, nativeQuery = true)
    List<Intervention> searchInterventions(
            @Param("description") String description,
            @Param("technician") User technician
    );
}
