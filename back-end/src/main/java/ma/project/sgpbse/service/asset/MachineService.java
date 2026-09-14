package ma.project.sgpbse.service.asset;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import ma.project.sgpbse.component.asset.MachineCreationFactory;
import ma.project.sgpbse.dto.asset.request.MachineRequestDto;
import ma.project.sgpbse.dto.asset.response.MachineResponseDto;
import ma.project.sgpbse.dto.asset.response.VehicleResponseDto;
import ma.project.sgpbse.entity.asset.Machine;
import ma.project.sgpbse.enums.AssetStatus;
import ma.project.sgpbse.exception.asset.MachineNotExistException;
import ma.project.sgpbse.mapper.asset.MachineMapper;
import ma.project.sgpbse.repository.asset.MachineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@AllArgsConstructor

@Service
public class MachineService{

    @Autowired
    private final MachineRepository machineRepository;
    @Autowired
    private final MachineMapper machineMapper;
    @Autowired
    private final AssetService assetService;


    //create machine
    @Transactional
    public MachineResponseDto createMachine(MachineRequestDto machineRequestDto){

        //get machine from dto
        Machine machine = machineMapper.toEntity(machineRequestDto);

        String assignment = machineRequestDto.getAssignment();

        if (assignment == null || assignment.isBlank()) {
            machine.setAssetStatus(AssetStatus.AVAILABLE);
        } else {
            machine.setAssetStatus(AssetStatus.IN_USE);
        }

        //save it to database
        machineRepository.save(machine);

        //return response as dto
        return machineMapper.toDto(machine);
    }

    //update
    public Long updateMachine(Long id, MachineRequestDto machineRequestDto){

        //check if machine exist
        Machine machine = machineRepository.findById(id)
                .orElseThrow(
                        () -> new MachineNotExistException("Aucune machine trouvé !")
                );

        //update machine from dto
        machineMapper.updateEntityFromDto(machineRequestDto, machine);

        //save updates
        machineRepository.save(machine);

        return machine.getId();
    }

    //delete
    public String deleteMachine(Long id){

        //check if machine exist
        Machine machine = machineRepository.findById(id)
                .orElseThrow(
                        () -> new MachineNotExistException("Aucune machine trouvé !")
                );

        //delete machine
        machineRepository.deleteById(id);

        return "Successfully deleted !";
    }

    //get
    public MachineResponseDto getMachine(Long id){

        //check if machine exist
        Machine machine = machineRepository.findById(id)
                .orElseThrow(
                        () -> new MachineNotExistException("Aucune machine trouvé !")
                );

        MachineResponseDto dto = machineMapper.toDto(machine);

        dto.setDocumentResponseDtoSet(assetService.getAllDocuments(machine.getId()));

        //return result
        return dto;
    }

    //getAll
    public List<MachineResponseDto> getAllMachine(){

        return machineMapper.toDtos(
                machineRepository.findAll()
        );
    }


}
