package ma.project.sgpbse.service.publicLighting;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import ma.project.sgpbse.dto.publicLighting.request.FailureRequestDto;
import ma.project.sgpbse.dto.publicLighting.response.FailureResponseDto;
import ma.project.sgpbse.entity.publicLighting.Failure;
import ma.project.sgpbse.entity.publicLighting.Intervention;
import ma.project.sgpbse.entity.publicLighting.LightPoint;
import ma.project.sgpbse.entity.user.User;
import ma.project.sgpbse.enums.FailureStatus;
import ma.project.sgpbse.mapper.publicLighting.FailureMapper;
import ma.project.sgpbse.repository.publicLighting.FailureRepository;
import ma.project.sgpbse.service.NotificationService;
import ma.project.sgpbse.service.user.CurrentUserService;
import ma.project.sgpbse.service.user.UserService;
import org.hibernate.annotations.SecondaryRow;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@AllArgsConstructor

@Service
public class FailureService {

    @Autowired
    private final FailureRepository failureRepository;
    @Autowired
    private final FailureMapper failureMapper;
    @Autowired
    private final LightPointService lightPointService;
    @Autowired
    private final UserService userService;
    @Autowired
    private final NotificationService  notificationService;
    @Autowired
    private final CurrentUserService currentUserService;


    //déclarer une panne
    @Transactional
    public FailureResponseDto reportFailure(FailureRequestDto failureRequestDto){

        //1.check if light point exist
        String location = failureRequestDto.getLocation();
        LightPoint lightPoint = lightPointService.getLightPointByLocation(location);

        //get entity from dto
        Failure failure = failureMapper.toEntity(failureRequestDto);

        //set other attributs
        failure.setReportDate(LocalDateTime.now());
        failure.setFailureStatus(FailureStatus.UNRESOLVED);
        failure.setLightPoint(lightPoint);

        //save failure into db
        failureRepository.save(failure);

        //add failure to light point
        lightPointService.addFailure(lightPoint, failure);

        //envoyer notif sur l'accident
        List<User> receivers = userService.filterByPermissionName("GET_FAILURE_NOTIFICATION");
        User sender = currentUserService.getCurrentUser();
        String title = "Déclaration d'une panne d'un point lumineux";
        String message = String.format("Le point lumineux %s est en panne !",
                lightPoint.getDesignation_fr()
        );
        for (User receiver : receivers) {
            notificationService.sendDirectNotification(sender, receiver, title, message);
        }

        //return result
        return failureMapper.toDto(failure);
    }

    //régler une panne
    @Transactional
    public FailureResponseDto resolveFailure(Long failure_id){

        //1.check if failure exist
        Failure failure = getFailureById(failure_id);

        //2.update failure status
        failure.setFailureStatus(FailureStatus.RESOLVED);

        //save changes
        failureRepository.save(failure);

        //envoyer notif
        List<User> receivers = userService.filterByPermissionName("GET_FAILURE_NOTIFICATION");
        User sender = currentUserService.getCurrentUser();
        String title = "Réglage de panne";
        String message = String.format("La panne du point lumineux %s est réglée!",
                failure.getLightPoint().getDesignation_fr()
        );
        for (User receiver : receivers) {
            notificationService.sendDirectNotification(sender, receiver, title, message);
        }

        //return result
        return failureMapper.toDto(failure);
    }

    //get failure
    @Transactional
    public FailureResponseDto getFailure(Long failure_id){
        //1.check if failure exist
        Failure failure = getFailureById(failure_id);

        return failureMapper.toDto(failure);
    }

    //get all failures
    @Transactional
    public List<FailureResponseDto> getAllFailures(){
        return failureMapper.toDto(failureRepository.findAll());
    }

    //get failure by id
    @Transactional
    public Failure getFailureById(Long failure_id){
        Failure failure = failureRepository.findById(failure_id)
                .orElseThrow(() -> new IllegalArgumentException("No such failure with id: " + failure_id));

        return failure;
    }

    @Transactional
    public void linkToIntervention(Failure failure, Intervention intervention){
        failure.setIntervention(intervention);
        failureRepository.save(failure);
    }

    //count all declared failures
    @Transactional
    public Long countAllFailures(){
        return failureRepository.count();
    }
}
