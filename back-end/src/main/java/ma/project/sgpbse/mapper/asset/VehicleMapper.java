package ma.project.sgpbse.mapper.asset;

import ma.project.sgpbse.dto.asset.request.VehicleRequestDto;
import ma.project.sgpbse.dto.asset.response.VehicleResponseDto;
import ma.project.sgpbse.entity.asset.Vehicle;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring", uses = AssetMapper.class)
public interface VehicleMapper {

    @Mapping(target = "assetStatus", constant = "AVAILABLE")
    @Mapping(source = "inventoryNumber", target = "inventory_id")
    @Mapping(source = "acquisitionDate", target = "acquisition_date")
    @Mapping(source = "acquisitionValue", target = "purchase_value")
    Vehicle toEntity(VehicleRequestDto dto);

    @Mapping(source = "inventory_id", target = "inventoryNumber")
    @Mapping(source = "acquisition_date", target = "acquisitionDate")
    @Mapping(source = "purchase_value", target = "purchaseValue")
    VehicleResponseDto toDto(Vehicle vehicle);

    @Mapping(source = "inventoryNumber", target = "inventory_id")
    @Mapping(source = "acquisitionDate", target = "acquisition_date")
    @Mapping(source = "acquisitionValue", target = "purchase_value")
    void updateEntityFromDto(
            VehicleRequestDto vehicleRequestDto,
            @MappingTarget Vehicle vehicle
    );

    List<VehicleResponseDto> toDtos(List<Vehicle> vehicleList);
}