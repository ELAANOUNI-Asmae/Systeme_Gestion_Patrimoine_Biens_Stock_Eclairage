package ma.project.sgpbse.repository;

import ma.project.sgpbse.entity.DueDate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface DueDateRepository extends JpaRepository<DueDate, Integer> {

    @Modifying
    @Query("DELETE FROM DueDate d WHERE d.treated = true")
    void deleteByTreatedTrue();
}
