package ma.project.sgpbse.service.asset;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import ma.project.sgpbse.dto.asset.request.DocumentRequestDto;
import ma.project.sgpbse.dto.asset.request.FuelTankRequestDto;
import ma.project.sgpbse.dto.asset.response.FuelTankResponseDto;
import ma.project.sgpbse.entity.asset.Accident;
import ma.project.sgpbse.entity.asset.Document;
import ma.project.sgpbse.entity.asset.FuelTank;
import ma.project.sgpbse.entity.asset.Vehicle;
import ma.project.sgpbse.entity.user.User;
import ma.project.sgpbse.exception.asset.FuelTankNotExistException;
import ma.project.sgpbse.mapper.asset.FuelTankMapper;
import ma.project.sgpbse.repository.asset.FuelTankRepository;
import ma.project.sgpbse.service.NotificationService;
import ma.project.sgpbse.service.user.CurrentUserService;
import ma.project.sgpbse.service.user.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

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
    @Autowired
    private final DocumentService documentService;
    @Autowired
    private final UserService  userService;
    @Autowired
    private final NotificationService  notificationService;
    @Autowired
    private final CurrentUserService  currentUserService;

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

        //envoyer notif sur l'accident
        List<User> receivers = userService.filterByPermissionName("GET_FUEL_TANK_NOTIFICATION");
        User sender = currentUserService.getCurrentUser();
        String title = "Chargement de réservoir d'un véhicule";
        String message = String.format("La véhicule %s a chargé son réservoir !",
                vehicle.getDesignation()
        );
        for (User receiver : receivers) {
            notificationService.sendDirectNotification(sender, receiver, title, message);
        }


        //5.return result
        return fuelTank.getId();

    }

    //get
    @Transactional
    public FuelTankResponseDto getFuelTank(Long fuel_tank_id){

        //1.check if fuel tank exist
        FuelTank fuelTank = getFuelTankById(fuel_tank_id);

        return fuelTankMapper.toDto(fuelTank);
    }

    //getAll
    @Transactional
    public List<FuelTankResponseDto> getAllFuelTanks(){
        return fuelTankMapper.toDtos(fuelTankRepository.findAll());
    }

    @Transactional
    public FuelTank getFuelTankById(Long id){
        FuelTank fuelTank = fuelTankRepository.findById(id)
                .orElseThrow(() -> new FuelTankNotExistException("FuelTank Not Exist"));
        return fuelTank;
    }

    //join document
    @Transactional
    public String joinDoc(Long id, MultipartFile file, DocumentRequestDto documentRequestDto){

        //1.check if accident exist
        FuelTank fuelTank = getFuelTankById(id);

        //set target permission
        String targetPermission = "GET_ALERT_FUEL_THANK_OFF_DOCS";

        //2.process the doc
        Document document = documentService.createDocument(documentRequestDto, file, targetPermission);

        //3. linking between doc and accident
        documentService.addFuelTank(document, fuelTank);

        fuelTank.getDocList().add(document);
        fuelTankRepository.save(fuelTank);

        return "uploaded successfully !";
    }
}
