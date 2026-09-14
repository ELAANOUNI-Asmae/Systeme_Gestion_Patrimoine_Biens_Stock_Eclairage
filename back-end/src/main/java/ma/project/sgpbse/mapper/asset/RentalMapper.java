package ma.project.sgpbse.mapper.asset;

import ma.project.sgpbse.dto.asset.request.RentalRequestDto;
import ma.project.sgpbse.dto.asset.response.RentalResponseDto;
import ma.project.sgpbse.entity.asset.Rental;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;

import java.util.List;

@Mapper(componentModel = "spring", uses = DocumentMapper.class)
public interface RentalMapper {

    @Mapping(source = ".", target = "assetName", qualifiedByName = "getAssetName")
    RentalResponseDto toDto(Rental rental);

    @Named("getAssetName")
    default String getAssetName(Rental rental) {
        return rental.getAsset().getDesignation();
    }

    @Mapping(target ="rentalStatus" , constant ="PLANNED")
    Rental toEntity(RentalRequestDto rentalRequestDto);

    void updateEntityFromDto(RentalRequestDto rentalRequestDto, @MappingTarget Rental rental);

    List<RentalResponseDto> toDtos(List<Rental> rentalList);


}
