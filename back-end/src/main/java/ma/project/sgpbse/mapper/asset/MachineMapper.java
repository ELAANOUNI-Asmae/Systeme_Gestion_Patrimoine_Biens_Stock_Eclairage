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

    @Mapping(target ="assetStatus" , constant ="AVAILABLE")
    Machine toEntity(MachineRequestDto dto);

    MachineResponseDto toDto(Machine machine);

    void updateEntityFromDto(MachineRequestDto machineRequestDto, @MappingTarget Machine machine);

    List<MachineResponseDto> toDtos(List<Machine> machineList);
}
