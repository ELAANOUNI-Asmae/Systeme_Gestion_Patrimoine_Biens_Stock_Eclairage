package ma.project.sgpbse.repository.asset;

import ma.project.sgpbse.entity.asset.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
}
