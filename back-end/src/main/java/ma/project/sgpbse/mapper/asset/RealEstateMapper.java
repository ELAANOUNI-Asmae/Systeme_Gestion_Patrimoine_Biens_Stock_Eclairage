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

    @Mapping(target ="assetStatus" , constant ="AVAILABLE")
    RealEstate toEntity(RealEstateRequestDto dto);

    RealEstateResponseDto toDto(RealEstate entity);
    void updateEntityFromDto(RealEstateRequestDto dto, @MappingTarget RealEstate entity);
    List<RealEstateResponseDto> toDtos(List<RealEstate> realEstates);
}
