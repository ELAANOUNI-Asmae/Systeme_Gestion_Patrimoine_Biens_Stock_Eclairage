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

    @Mapping(target ="assetStatus" , constant ="AVAILABLE")
    Vehicle toEntity(VehicleRequestDto dto);

    VehicleResponseDto toDto(Vehicle vehicle);

    void updateEntityFromDto(VehicleRequestDto vehicleRequestDto, @MappingTarget Vehicle vehicle);

    List<VehicleResponseDto> toDtos(List<Vehicle> vehicleList);
}
