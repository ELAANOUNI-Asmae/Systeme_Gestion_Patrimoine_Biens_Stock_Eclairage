package ma.project.sgpbse.controller.stock;

import lombok.AllArgsConstructor;
import ma.project.sgpbse.service.stock.StockMovementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@AllArgsConstructor

@RestController
@RequestMapping("/sgpbse/stockMovement")
public class StockMovementController {

    @Autowired
    private final StockMovementService stockMovementService;

}
