package ma.project.sgpbse.mapper.publicLighting;

import ma.project.sgpbse.dto.publicLighting.request.InterventionRequestDto;
import ma.project.sgpbse.dto.publicLighting.response.InterventionResponseDto;
import ma.project.sgpbse.entity.publicLighting.Intervention;
import ma.project.sgpbse.mapper.asset.DocumentMapper;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring", uses = DocumentMapper.class)
public interface InterventionMapper {

    Intervention toEntity(InterventionRequestDto interventionRequestDto);

    InterventionResponseDto toDto(Intervention intervention);

    List<InterventionResponseDto> toDto(List<Intervention> interventions);

}
