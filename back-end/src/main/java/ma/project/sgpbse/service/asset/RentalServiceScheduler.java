package ma.project.sgpbse.service.asset;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import ma.project.sgpbse.enums.RentalStatus;
import ma.project.sgpbse.repository.asset.RentalRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
public class RentalServiceScheduler {

    private final RentalRepository rentalRepository;

    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void updateRentalStatus(){
        LocalDate now = LocalDate.now();
        rentalRepository.updateStatus(RentalStatus.ACTIVE);
    }
}
