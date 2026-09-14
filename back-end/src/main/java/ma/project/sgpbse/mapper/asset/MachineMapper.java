package ma.project.sgpbse.mapper.asset;

import ma.project.sgpbse.dto.asset.request.MachineRequestDto;
import ma.project.sgpbse.dto.asset.response.MachineResponseDto;
import ma.project.sgpbse.entity.asset.Machine;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring", uses = AssetMapper.class)
public interface MachineMapper {

    @Mapping(target = "assetStatus", constant = "AVAILABLE")
    @Mapping(source = "inventoryNumber", target = "inventory_id")
    @Mapping(source = "acquisitionDate", target = "acquisition_date")
    @Mapping(source = "acquisitionValue", target = "purchase_value")
    Machine toEntity(MachineRequestDto dto);

    @Mapping(source = "inventory_id", target = "inventoryNumber")
    @Mapping(source = "acquisition_date", target = "acquisitionDate")
    @Mapping(source = "purchase_value", target = "purchaseValue")
    MachineResponseDto toDto(Machine machine);

    @Mapping(source = "inventoryNumber", target = "inventory_id")
    @Mapping(source = "acquisitionDate", target = "acquisition_date")
    @Mapping(source = "acquisitionValue", target = "purchase_value")
    void updateEntityFromDto(
            MachineRequestDto machineRequestDto,
            @MappingTarget Machine machine
    );

    List<MachineResponseDto> toDtos(List<Machine> machineList);
}