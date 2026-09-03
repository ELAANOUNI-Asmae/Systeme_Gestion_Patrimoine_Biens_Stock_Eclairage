package ma.project.sgpbse.mapper.publicLighting;


import ma.project.sgpbse.dto.publicLighting.request.FailureRequestDto;
import ma.project.sgpbse.dto.publicLighting.response.FailureResponseDto;
import ma.project.sgpbse.entity.publicLighting.Failure;
import ma.project.sgpbse.entity.publicLighting.LightPoint;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.List;

@Mapper(componentModel = "spring")
public interface FailureMapper {

    Failure toEntity(FailureRequestDto failureRequestDto);

    @Mapping(target = "location", source = "lightPoint", qualifiedByName = "getLightPointLocation")
    FailureResponseDto toDto(Failure failure);

    @Mapping(target = "location", source = "lightPoint", qualifiedByName = "getLightPointLocation")
    List<FailureResponseDto> toDto(List<Failure> failures);

    @Named("getLightPointLocation")
    static String getLightPointLocation(LightPoint lightPoint) {
        return lightPoint.getLocation();
    }

}
