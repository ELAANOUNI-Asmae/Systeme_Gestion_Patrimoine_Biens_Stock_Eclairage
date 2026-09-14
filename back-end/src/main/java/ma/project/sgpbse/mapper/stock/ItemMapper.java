package ma.project.sgpbse.mapper.stock;

import ma.project.sgpbse.dto.stock.request.ItemReqDto;
import ma.project.sgpbse.dto.stock.response.ItemResDto;
import ma.project.sgpbse.entity.stock.Item;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ItemMapper {
    Item toEntity(ItemReqDto itemReqDto);
    ItemResDto toDto(Item item);
    List<ItemResDto> toDtoList(List<Item> items);
    void updateItemFromDto(ItemReqDto itemReqDto, @MappingTarget Item item);
}
