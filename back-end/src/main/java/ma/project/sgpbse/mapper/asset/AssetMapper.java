package ma.project.sgpbse.mapper.asset;

import ma.project.sgpbse.dto.asset.response.AssetResponseDto;
import ma.project.sgpbse.entity.asset.Asset;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring", uses = DocumentMapper.class)
public interface AssetMapper {

    AssetResponseDto toDto(Asset asset);
    List<AssetResponseDto> toDtos(List<Asset> assets);
}
