package ma.project.sgpbse.service.asset;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import ma.project.sgpbse.dto.asset.request.FuelTankRequestDto;
import ma.project.sgpbse.dto.asset.response.FuelTankResponseDto;
import ma.project.sgpbse.entity.asset.FuelTank;
import ma.project.sgpbse.entity.asset.Vehicle;
import ma.project.sgpbse.exception.asset.FuelTankNotExistException;
import ma.project.sgpbse.mapper.asset.FuelTankMapper;
import ma.project.sgpbse.repository.asset.FuelTankRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@AllArgsConstructor
@Service
public class FuelTankService {

    @Autowired
    private FuelTankRepository fuelTankRepository;
    @Autowired
    private FuelTankMapper fuelTankMapper;
    @Autowired
    private final VehicleService vehicleService;

    //refuel Vehicle
    @Transactional
    public Long refuelVehicle(Long vehicle_id, FuelTankRequestDto fuelTankRequestDto){

        //1.check if vehicle exist
        Vehicle vehicle = vehicleService.getVehicleById(vehicle_id);

        //2.get fuelTank entity from dto
        FuelTank fuelTank = fuelTankMapper.toEntity(fuelTankRequestDto);

        //3.add fuel tank to vehicle
        vehicleService.addFuelTankToVehicle(vehicle, fuelTank);

        //4.save fuel tank to db
        fuelTankRepository.save(fuelTank);

        //5.return result
        return fuelTank.getId();

    }

    //get
    @Transactional
    public FuelTankResponseDto getFuelTank(Long fuel_tank_id){

        //1.check if fuel tank exist
        FuelTank fuelTank = fuelTankRepository.findById(fuel_tank_id)
                .orElseThrow(() -> new FuelTankNotExistException("FuelTank Not Exist"));

        return fuelTankMapper.toDto(fuelTank);
    }

    //getAll
    @Transactional
    public List<FuelTankResponseDto> getAllFuelTanks(){
        return fuelTankMapper.toDtos(fuelTankRepository.findAll());
    }
}
