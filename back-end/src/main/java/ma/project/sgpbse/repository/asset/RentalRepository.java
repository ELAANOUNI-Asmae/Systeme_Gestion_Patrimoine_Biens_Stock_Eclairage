package ma.project.sgpbse.repository.asset;

import ma.project.sgpbse.entity.asset.Rental;
import ma.project.sgpbse.enums.RentalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


@Repository
public interface RentalRepository extends JpaRepository<Rental, Long> {

    @Modifying
    @Query("UPDATE Rental r SET r.rentalStatus = :status WHERE r.startDate <= CURRENT_DATE AND r.rentalStatus != :status")
    int updateStatus(@Param("status") RentalStatus status);
}
