package ma.project.sgpbse.dto.stock.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
@Getter
@Setter
public class OutStockResponseDto {

    private LocalDate mouvementDate;
    private Long quantity;
    private String receiver_name;
    private String item_name;

}
