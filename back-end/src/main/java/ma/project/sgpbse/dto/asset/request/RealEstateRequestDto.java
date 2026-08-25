package ma.project.sgpbse.dto.asset.request;

import lombok.Getter;
import lombok.NonNull;
import lombok.Setter;
import ma.project.sgpbse.enums.Domain;

@Getter
@Setter

public class RealEstateRequestDto extends AssetRequestDto{
    @NonNull
    private String landTitleReference;
    @NonNull
    private String cadastralReference;
    @NonNull
    private Double areaM2;
    @NonNull
    private String gpsLocation;
    private Domain domain;
    @NonNull
    private String realEstateType;
}
