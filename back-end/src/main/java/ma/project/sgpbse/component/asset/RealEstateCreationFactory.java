package ma.project.sgpbse.component.asset;

import ma.project.sgpbse.dto.asset.request.RealEstateRequestDto;
import ma.project.sgpbse.entity.asset.RealEstate;
import ma.project.sgpbse.mapper.asset.RealEstateMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class RealEstateCreationFactory extends AssetCreationFactory<RealEstate, RealEstateRequestDto>{

    @Autowired
    private RealEstateMapper realEstateMapper;

    @Override
    public RealEstate createEntity(RealEstateRequestDto dto){
        return realEstateMapper.toEntity(dto);
    }

}
