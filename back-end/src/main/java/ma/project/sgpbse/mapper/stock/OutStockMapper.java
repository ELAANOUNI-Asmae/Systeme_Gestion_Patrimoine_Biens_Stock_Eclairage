package ma.project.sgpbse.mapper.stock;

import ma.project.sgpbse.dto.stock.request.OutStockRequestDto;
import ma.project.sgpbse.dto.stock.response.OutStockResponseDto;
import ma.project.sgpbse.entity.stock.InStock;
import ma.project.sgpbse.entity.stock.OutStock;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface OutStockMapper {

    OutStock toEntity(OutStockRequestDto outStockRequestDto);

    @Mapping(target = "item_name", source = ".", qualifiedByName = "getItemName")
    OutStockResponseDto toDto(OutStock outStock);

    @Named("getItemName")
    default String getItemName(OutStock outStock) {
        if (outStock == null || outStock.getItem() == null) {
            return null;
        }
        return outStock.getItem().getName();
    }
}
