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
public class ItemResDto {
    private Long id;
    private String reference;
    private String name;
    private String designationAr;
    private String serialNumber;
    private String category;
    private String categoryAr;
    private Long quantity;
    private Long alertThreshold;
    private Double price;
    private Double vatRate;
    private String unit;
    private String brand;
    private String location_fr;
    private String location_ar;
    private LocalDate updatedAt;
    private List<StockDocumentResponseDto> documents = new ArrayList<>();
}
