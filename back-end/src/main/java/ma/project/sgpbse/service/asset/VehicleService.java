package ma.project.sgpbse.service.asset;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import ma.project.sgpbse.dto.asset.request.VehicleRequestDto;
import ma.project.sgpbse.dto.asset.response.VehicleResponseDto;
import ma.project.sgpbse.entity.asset.*;
import ma.project.sgpbse.enums.AssetStatus;
import ma.project.sgpbse.exception.asset.VehicleNotExistException;
import ma.project.sgpbse.mapper.asset.VehicleMapper;
import ma.project.sgpbse.repository.asset.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@AllArgsConstructor
@Service
public class VehicleService{
    @Autowired
    private final VehicleRepository vehicleRepository;
    @Autowired
    private final VehicleMapper vehicleMapper;
    @Autowired
    private final AssetService assetService;


    //create vehicle
    @Transactional
    public VehicleResponseDto createVehicle(VehicleRequestDto vehicleRequestDto){

        //get vehicle from dto
        Vehicle vehicle = vehicleMapper.toEntity(vehicleRequestDto);

        if (assetService.assignmentIsNull(vehicle.getId())){
            vehicle.setAssetStatus(AssetStatus.AVAILABLE);
        }
        else{
            vehicle.setAssetStatus(AssetStatus.IN_USE);
        }

        //save it to database
        vehicleRepository.save(vehicle);

        //return response as dto
        return vehicleMapper.toDto(vehicle);
    }

    //update
    @Transactional
    public Long updateVehicle(Long id, VehicleRequestDto vehicleRequestDto){

        //check if vehicle exist
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(
                        () -> new VehicleNotExistException("Aucune vehicle trouvé !")
                );

        //update vehicle from dto
        vehicleMapper.updateEntityFromDto(vehicleRequestDto, vehicle);

        //save updates
        vehicleRepository.save(vehicle);

        return vehicle.getId();
    }

    //delete
    @Transactional
    public String deleteVehicle(Long id){

        //check if vehicle exist
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(
                        () -> new VehicleNotExistException("Aucune vehicle trouvé !")
                );

        //delete vehicle
        vehicleRepository.deleteById(id);

        return "Successfully deleted !";
    }

    //get
    @Transactional
    public VehicleResponseDto getVehicle(Long id){

        //check if vehicle exist
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(
                        () -> new VehicleNotExistException("Aucune vehicle trouvé !")
                );


        VehicleResponseDto dto = vehicleMapper.toDto(vehicle);

        dto.setDocumentResponseDtoSet(assetService.getAllDocuments(vehicle.getId()));

        //return result
        return dto;
    }

    //getAll
    @Transactional
    public List<VehicleResponseDto> getAllVehicles(){

        return vehicleMapper.toDtos(
                vehicleRepository.findAll()
        );
    }

    //get Vehicle by id
    @Transactional
    public Vehicle getVehicleById(Long id){
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(
                        () -> new VehicleNotExistException("Aucune vehicle trouvé !")
                );
        return vehicle;
    }

    @Transactional
    public void updateVehicleStatus(Long id, AssetStatus status){
        assetService.updateStatus(id, status);
    }

    //add accident
    @Transactional
    public void addAccidentToVehicle(Vehicle vehicle, Accident accident){
        vehicle.getAccidents().add(accident);
        vehicleRepository.save(vehicle);
    }

    //add fuel tank
    @Transactional
    public void addFuelTankToVehicle(Vehicle vehicle, FuelTank fuelTank){
        vehicle.getFuelTanks().add(fuelTank);
        vehicleRepository.save(vehicle);
    }
}
