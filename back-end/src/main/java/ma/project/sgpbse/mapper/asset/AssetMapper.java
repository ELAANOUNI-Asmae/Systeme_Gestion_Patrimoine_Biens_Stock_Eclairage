package ma.project.sgpbse.mapper.asset;

import ma.project.sgpbse.dto.asset.request.AssetDtoRequest;
import ma.project.sgpbse.dto.asset.response.AssetDtoResponse;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface AssetMapper {

    Asset toDto(AssetDtoRequest assetDtoRequest);
    AssetDtoResponse toEntity(Asset asset);
    List<AssetDtoResponse> toDtos(List<Asset> assets);
}
