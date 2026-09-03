package ma.project.sgpbse.dto.stock.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class ItemResDto {

    private Long id;
    private String name;
    private String serialNumber;
    private Long alertThreshold;
    private Double price;
    private String unit;
    private String brand;
    private String location_fr;
    private String location_ar;
}
