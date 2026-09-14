package ma.project.sgpbse.mapper.stock;

import ma.project.sgpbse.dto.stock.request.InStockRequestDto;
import ma.project.sgpbse.dto.stock.response.InStockResponseDto;
import ma.project.sgpbse.entity.stock.InStock;
import ma.project.sgpbse.mapper.asset.DocumentMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring", uses = DocumentMapper.class)
public interface InStockMapper {

    InStock toEntity(InStockRequestDto inStockRequestDto);

    @Mapping(target = "item_name", source = ".", qualifiedByName = "getItemName")
    InStockResponseDto toDto(InStock inStock);

    @Named("getItemName")
    default String getItemName(InStock inStock) {
        return inStock.getItem().getName();
    }
}
