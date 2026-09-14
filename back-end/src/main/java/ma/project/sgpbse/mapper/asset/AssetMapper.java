package ma.project.sgpbse.mapper.asset;

import ma.project.sgpbse.dto.asset.response.AssetResponseDto;
import ma.project.sgpbse.entity.asset.Asset;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", uses = DocumentMapper.class)
public interface AssetMapper {

    @Mapping(source = "inventory_id", target = "inventoryNumber")
    @Mapping(source = "acquisition_date", target = "acquisitionDate")
    @Mapping(source = "purchase_value", target = "purchaseValue")
    @Mapping(source = "documents", target = "documentResponseDtoSet")
    @Mapping(source = "disposal.disposalDate", target = "archivedAt")
    AssetResponseDto toDto(Asset asset);

    List<AssetResponseDto> toDtos(List<Asset> assets);
}