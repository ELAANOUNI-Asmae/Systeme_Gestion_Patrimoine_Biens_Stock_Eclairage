package ma.project.sgpbse.mapper.asset;

import ma.project.sgpbse.dto.asset.request.DocumentRequestDto;
import ma.project.sgpbse.dto.asset.response.DocumentResponseDto;
import ma.project.sgpbse.entity.asset.Document;
import org.mapstruct.Mapper;

import java.util.List;
import java.util.Set;

@Mapper(componentModel = "spring")
public interface DocumentMapper {

    Set<Document> toEntities(Set<DocumentRequestDto> documentRequestDtoSet);
    List<DocumentResponseDto> toDtosList(List<Document> documents);
    Set<DocumentResponseDto> toDtosSet(Set<Document> documents);

}
