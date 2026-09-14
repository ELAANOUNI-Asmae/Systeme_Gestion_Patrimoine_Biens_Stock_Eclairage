package ma.project.sgpbse.component.asset;

import ma.project.sgpbse.dto.asset.request.VehicleRequestDto;
import ma.project.sgpbse.entity.asset.Vehicle;
import ma.project.sgpbse.mapper.asset.VehicleMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class VehicleCreationFactory extends AssetCreationFactory<Vehicle, VehicleRequestDto> {

    @Autowired
    private VehicleMapper vehicleMapper;

    @Override
    public Vehicle createEntity(VehicleRequestDto dto){
        return vehicleMapper.toEntity(dto);}

}
