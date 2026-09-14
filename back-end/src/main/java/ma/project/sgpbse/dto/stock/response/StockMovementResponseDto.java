package ma.project.sgpbse.dto.stock.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StockMovementResponseDto {
    private Long id;
    private Long articleId;
    private String articleDesignation;
    private String articleDesignationAr;
    private String type;
    private Long quantity;
    private String reason;
    private String supplierOrBeneficiary;
    private String reference;
    private String performedBy;
    private LocalDate date;
    private Double unitPriceHt;
    private Double vatRate;
    private Long supplyRequestId;
    private List<StockDocumentResponseDto> documents = new ArrayList<>();
}
