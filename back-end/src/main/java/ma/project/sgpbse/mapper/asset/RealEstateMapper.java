package ma.project.sgpbse.mapper.asset;

import ma.project.sgpbse.dto.asset.request.RealEstateRequestDto;
import ma.project.sgpbse.dto.asset.response.RealEstateResponseDto;
import ma.project.sgpbse.entity.asset.RealEstate;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring", uses = AssetMapper.class)
public interface RealEstateMapper {

    @Mapping(target = "assetStatus", constant = "AVAILABLE")
    @Mapping(source = "inventoryNumber", target = "inventory_id")
    @Mapping(source = "acquisitionDate", target = "acquisition_date")
    @Mapping(source = "acquisitionValue", target = "purchase_value")
    RealEstate toEntity(RealEstateRequestDto dto);

    @Mapping(source = "inventory_id", target = "inventoryNumber")
    @Mapping(source = "acquisition_date", target = "acquisitionDate")
    @Mapping(source = "purchase_value", target = "purchaseValue")
    RealEstateResponseDto toDto(RealEstate entity);

    @Mapping(source = "inventoryNumber", target = "inventory_id")
    @Mapping(source = "acquisitionDate", target = "acquisition_date")
    @Mapping(source = "acquisitionValue", target = "purchase_value")
    void updateEntityFromDto(
            RealEstateRequestDto dto,
            @MappingTarget RealEstate entity
    );

    List<RealEstateResponseDto> toDtos(List<RealEstate> realEstates);
}