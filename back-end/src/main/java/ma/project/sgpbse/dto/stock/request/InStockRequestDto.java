package ma.project.sgpbse.dto.stock.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NonNull;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class InStockRequestDto {

    @NonNull
    private Double unitEntryPrice;
    @NonNull
    private int vat;
    @NonNull
    private String supplierName;
    @NonNull
    private Long quantity;
    @NonNull
    private String operationRef;
}
