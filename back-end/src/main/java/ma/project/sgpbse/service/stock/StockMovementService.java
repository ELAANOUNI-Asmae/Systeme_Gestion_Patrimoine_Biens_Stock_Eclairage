package ma.project.sgpbse.service.stock;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import ma.project.sgpbse.repository.stock.StockMovementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@AllArgsConstructor
public class StockMovementService {

    @Autowired
    private final StockMovementRepository stockMovementRepository;

    //count by period
    @Transactional
    public Long countAllStockMovementByPeriod(Long day_numbers){
        LocalDateTime startDate = LocalDateTime.now().minusDays(day_numbers);
        return stockMovementRepository.countByMouvementDateAfter(startDate);
    }

}
