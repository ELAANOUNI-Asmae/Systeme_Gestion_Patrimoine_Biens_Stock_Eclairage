package ma.project.sgpbse.component.asset;

import ma.project.sgpbse.dto.asset.request.MachineRequestDto;
import ma.project.sgpbse.entity.asset.Machine;
import ma.project.sgpbse.mapper.asset.MachineMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

@Component
public class MachineCreationFactory extends AssetCreationFactory<Machine, MachineRequestDto>{

    @Autowired
    private MachineMapper machineMapper;

    @Override
    public Machine createEntity(MachineRequestDto dto) {
        return machineMapper.toEntity(dto);
    }
}
