package ma.project.sgpbse.dto.stock.request;

import lombok.Getter;
import lombok.NonNull;
import lombok.Setter;

import java.time.LocalDate;
@Getter
@Setter
public class OutStockRequestDto {

    @NonNull
    private LocalDate mouvementDate;
    @NonNull
    private Long quantity;
    @NonNull
    private String receiver_id;
}
