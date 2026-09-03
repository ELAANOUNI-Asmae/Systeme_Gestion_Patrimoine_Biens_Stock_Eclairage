package ma.project.sgpbse.mapper.stock;

import ma.project.sgpbse.dto.stock.request.ItemRequestDto;
import ma.project.sgpbse.entity.stock.ItemRequest;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ItemRequestMapper {

    ItemRequest toEntity(ItemRequestDto itemRequestDto);
}
