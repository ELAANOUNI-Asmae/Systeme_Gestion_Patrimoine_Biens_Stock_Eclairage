package ma.project.sgpbse.service.asset;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import ma.project.sgpbse.dto.asset.request.AccidentRequestDto;
import ma.project.sgpbse.dto.asset.response.AccidentResponseDto;
import ma.project.sgpbse.entity.asset.Accident;
import ma.project.sgpbse.entity.asset.Vehicle;
import ma.project.sgpbse.enums.AssetStatus;
import ma.project.sgpbse.exception.asset.AssetNotExistException;
import ma.project.sgpbse.mapper.asset.AccidentMapper;
import ma.project.sgpbse.repository.asset.AccidentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@AllArgsConstructor
@Service
public class AccidentService {

    @Autowired
    private final AccidentRepository accidentRepository;
    @Autowired
    private final AccidentMapper accidentMapper;
    @Autowired
    private final VehicleService vehicleService;

    //déclarer accident
    @Transactional
    public Long createAccident(Long vehicle_id, AccidentRequestDto accidentRequestDto){

        //1.check if vehicle exist
        Vehicle vehicle = vehicleService.getVehicleById(vehicle_id);

        //2.get accident entity from dto
        Accident accident = accidentMapper.toEntity(accidentRequestDto);

        //3.change vehicle status
        vehicleService.updateVehicleStatus(vehicle_id, AssetStatus.DAMAGED);

        //4.save accident
        accidentRepository.save(accident);

        //5.link it to vehicle
        vehicleService.addAccidentToVehicle(vehicle, accident);

        //6.return result
        return accident.getId();

    }

    //get
    @Transactional
    public AccidentResponseDto getAccident(Long accident_id){

        //1.check if accident exist
        Accident accident = accidentRepository.findById(accident_id)
                .orElseThrow(
                        () -> new AssetNotExistException("Accident with id " + accident_id + " does not exist")
                );

        //return result
        return accidentMapper.toDto(accident);

    }

    //getAll
    @Transactional
    public List<AccidentResponseDto> getAllAccidents(){

        return accidentMapper.toDtos(accidentRepository.findAll());
    }
}
