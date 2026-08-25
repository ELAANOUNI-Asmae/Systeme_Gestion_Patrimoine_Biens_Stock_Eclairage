package ma.project.sgpbse.mapper.asset;

import ma.project.sgpbse.dto.asset.request.MaintenanceRequestDto;
import ma.project.sgpbse.dto.asset.response.MaintenanceResponseDto;
import ma.project.sgpbse.entity.asset.Maintenance;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring", uses = DocumentMapper.class)
public interface MaintenanceMapper {

    MaintenanceResponseDto toDto(Maintenance maintenance);

    Maintenance toEntity(MaintenanceRequestDto maintenanceRequestDto);

    void updateEntityFromDto(MaintenanceRequestDto maintenanceRequestDto, @MappingTarget Maintenance maintenance);

    List<MaintenanceResponseDto> toDtoList(List<Maintenance> maintenanceList);
}
