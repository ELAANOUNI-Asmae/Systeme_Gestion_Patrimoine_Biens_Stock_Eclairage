package ma.project.sgpbse.dto.stock.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ItemReqDto {
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
}
