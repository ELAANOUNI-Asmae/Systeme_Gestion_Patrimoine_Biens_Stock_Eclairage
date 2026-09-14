package ma.project.sgpbse.dto.stock.response;

import jakarta.persistence.OneToMany;
import lombok.Data;
import ma.project.sgpbse.dto.asset.response.DocumentResponseDto;
import java.util.List;

@Data
public class InStockResponseDto {

    private Long quantity;
    private Double unitEntryPrice;
    private int vat;
    private Double totalExcludingTax;
    private Double totalIncludingTax;
    private String supplierName;
    private String item_name;
    private String operationRef;

    @OneToMany(mappedBy = "inStock")
    private List<DocumentResponseDto> documentList;
}
