package ma.project.sgpbse.mapper.asset;

import ma.project.sgpbse.dto.asset.request.AccidentRequestDto;
import ma.project.sgpbse.dto.asset.response.AccidentResponseDto;
import ma.project.sgpbse.entity.asset.Accident;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.List;

@Mapper(componentModel = "spring", uses = DocumentMapper.class)
public interface AccidentMapper {

    @Mapping(source = ".", target = "vehicleName", qualifiedByName = "getVehicleName")
    AccidentResponseDto toDto(Accident accident);

    @Named("getVehicleName")
    default String getVehicleName(Accident accident) {
        return accident.getVehicle().getDesignation();
    }

    Accident toEntity(AccidentRequestDto accidentRequestDto);

    List<AccidentResponseDto> toDtos(List<Accident> accidentList);
}
