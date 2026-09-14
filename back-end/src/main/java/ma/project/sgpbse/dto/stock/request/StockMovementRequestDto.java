package ma.project.sgpbse.dto.stock.request;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class StockMovementRequestDto {
    private Long quantity;
    private String reason;
    private String supplierOrBeneficiary;
    private String reference;
    private LocalDate date;
    private Double unitPriceHt;
    private Double vatRate;
}
