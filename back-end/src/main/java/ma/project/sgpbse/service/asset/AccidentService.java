package ma.project.sgpbse.service.asset;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import ma.project.sgpbse.dto.asset.request.AccidentRequestDto;
import ma.project.sgpbse.dto.asset.request.DocumentRequestDto;
import ma.project.sgpbse.dto.asset.response.AccidentResponseDto;
import ma.project.sgpbse.entity.asset.Accident;
import ma.project.sgpbse.entity.asset.Document;
import ma.project.sgpbse.entity.asset.Vehicle;
import ma.project.sgpbse.entity.user.User;
import ma.project.sgpbse.enums.AssetStatus;
import ma.project.sgpbse.exception.asset.AssetNotExistException;
import ma.project.sgpbse.mapper.asset.AccidentMapper;
import ma.project.sgpbse.repository.asset.AccidentRepository;
import ma.project.sgpbse.service.NotificationService;
import ma.project.sgpbse.service.user.CurrentUserService;
import ma.project.sgpbse.service.user.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@AllArgsConstructor
@Service
public class AccidentService {

    @Autowired
    private final AccidentRepository accidentRepository;
    @Autowired
    private final AccidentMapper accidentMapper;
    @Autowired
    private final VehicleService vehicleService;
    @Autowired
    private final DocumentService documentService;
    @Autowired
    private final UserService userService;
    @Autowired
    private final CurrentUserService currentUserService;
    @Autowired
    private final NotificationService notificationService;

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

        //envoyer notif sur l'accident
        List<User> receivers = userService.filterByPermissionName("GET_ACCIDENT_NOTIFICATION");
        User sender = currentUserService.getCurrentUser();
        String title = "Déclaration d'accident";
        String message = String.format("Une accident est déclaré sur la véhicule %s conduite par %s",
                accident.getVehicle().getDesignation(),
                accident.getDriverName()
        );
        for (User receiver : receivers) {
            notificationService.sendDirectNotification(sender, receiver, title, message);
        }

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

    //join document
    @Transactional
    public String joinDoc(Long id, MultipartFile file, DocumentRequestDto documentRequestDto){

        //1.check if accident exist
        Accident accident = getAccidentById(id);

        //set the target permission
        String targetPermission = "GET_ALERT_ACCIDENT_OFF_DOCS";

        //2.process the doc
        Document document = documentService.createDocument(documentRequestDto, file, targetPermission);

        //3. linking between doc and accident
        documentService.addAccident(document, accident);

        accident.getDocumentList().add(document);
        accidentRepository.save(accident);

        return "uploaded successfully !";

    }

    @Transactional
    public Accident getAccidentById(Long id){
        Accident accident = accidentRepository.findById(id)
                .orElseThrow(() -> new AssetNotExistException("Accident with id " + id + " does not exist"));

        return accident;
    }
}
