package ma.project.sgpbse.dto.asset.response;


import ma.project.sgpbse.enums.AssetStatus;

import java.time.LocalDate;

public class AssetDtoResponse {

    private Long id;
    private String designation;
    private AssetStatus assetStatus;
    private LocalDate acuesition_date;
    private Double purchase_value;
    private String assignement;
    private String inventory_id;
}
