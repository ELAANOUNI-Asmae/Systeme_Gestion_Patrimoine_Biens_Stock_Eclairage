package ma.project.sgpbse.entity.asset;

import lombok.AllArgsConstructor;
import ma.project.sgpbse.enums.AssetStatus;

import java.time.LocalDate;

@AllArgsConstructor
public interface Asset {

    private Long id;
    private String designation;
    private AssetStatus assetStatus;
    private LocalDate acuesition_date;
    private Double purchase_value;
    private String assignement;
    private String inventory_id;

}
