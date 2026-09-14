package ma.project.sgpbse.dto.asset.response;

import lombok.Getter;
import lombok.Setter;
import ma.project.sgpbse.enums.Domain;

@Getter
@Setter
public class RealEstateResponseDto extends AssetResponseDto{

    private String landTitleReference;
    private String cadastralReference;
    private Double areaM2;
    private String gpsLocation;
    private Domain domain;
    private String realEstateType;
}
