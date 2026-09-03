package ma.project.sgpbse.mapper.publicLighting;

import ma.project.sgpbse.dto.publicLighting.request.LightPointRequestDto;
import ma.project.sgpbse.dto.publicLighting.response.LightPointResponseDto;
import ma.project.sgpbse.entity.publicLighting.LightPoint;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface LightPointMapper {

    LightPoint toEntity(LightPointRequestDto lightPointRequestDto);

    void updateEntityFromDto(LightPointRequestDto lightPointRequestDto, @MappingTarget LightPoint lightPoint);

    LightPointResponseDto toDto(LightPoint lightPoint);

    List<LightPointResponseDto> toDtos(List<LightPoint> lightPoints);
}
