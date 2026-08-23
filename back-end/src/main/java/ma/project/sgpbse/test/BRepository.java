package ma.project.sgpbse.test;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BRepository extends JpaRepository<B, Long> {}
