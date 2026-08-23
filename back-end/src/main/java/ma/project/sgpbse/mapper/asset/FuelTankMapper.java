package ma.project.sgpbse.mapper.asset;

import ma.project.sgpbse.dto.asset.request.FuelTankRequestDto;
import ma.project.sgpbse.dto.asset.response.FuelTankResponseDto;
import ma.project.sgpbse.entity.asset.FuelTank;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.List;

@Mapper(componentModel = "spring", uses = DocumentMapper.class)
public interface FuelTankMapper {

    @Mapping(source = ".", target = "vehicleName", qualifiedByName = "getVehicleName")
    FuelTankResponseDto toDto(FuelTank fuelTank);

    @Named("getVehicleName")
    default String getVehicleName(FuelTank fuelTank) {
        return fuelTank.getVehicle().getDesignation();
    }

    FuelTank toEntity(FuelTankRequestDto fuelTankRequestDto);

    List<FuelTankResponseDto> toDtos(List<FuelTank> fuelTankList);
}
