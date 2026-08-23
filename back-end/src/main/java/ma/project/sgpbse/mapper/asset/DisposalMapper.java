package ma.project.sgpbse.mapper.asset;

import ma.project.sgpbse.dto.asset.request.DisposalRequestDto;
import ma.project.sgpbse.dto.asset.response.DisposalResponseDto;
import ma.project.sgpbse.entity.asset.Disposal;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.List;

@Mapper(componentModel = "spring", uses = DocumentMapper.class)
public interface DisposalMapper {

    @Mapping(source = ".", target = "assetName", qualifiedByName = "getAssetName")
    DisposalResponseDto toDto(Disposal disposal);

    @Named("getAssetName")
    default String getAssetName(Disposal disposal) {
        return disposal.getAsset().getDesignation();
    }

    Disposal toEntity(DisposalRequestDto disposalRequestDto);

    List<DisposalResponseDto> toDtos(List<Disposal> disposalList);
}
