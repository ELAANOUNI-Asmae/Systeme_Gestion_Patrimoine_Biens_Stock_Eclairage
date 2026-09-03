package ma.project.sgpbse.service.publicLighting;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import ma.project.sgpbse.dto.asset.request.DocumentRequestDto;
import ma.project.sgpbse.dto.publicLighting.request.InterventionRequestDto;
import ma.project.sgpbse.dto.publicLighting.response.InterventionResponseDto;
import ma.project.sgpbse.entity.DueDate;
import ma.project.sgpbse.entity.asset.Document;
import ma.project.sgpbse.entity.publicLighting.Failure;
import ma.project.sgpbse.entity.publicLighting.Intervention;
import ma.project.sgpbse.entity.user.User;
import ma.project.sgpbse.enums.FailureStatus;
import ma.project.sgpbse.enums.InterventionStatus;
import ma.project.sgpbse.mapper.publicLighting.InterventionMapper;
import ma.project.sgpbse.repository.publicLighting.InterventionRepository;
import ma.project.sgpbse.service.DueDateService;
import ma.project.sgpbse.service.NotificationService;
import ma.project.sgpbse.service.asset.DocumentService;
import ma.project.sgpbse.service.user.CurrentUserService;
import ma.project.sgpbse.service.user.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@AllArgsConstructor

@Service
public class InterventionService {

    @Autowired
    private final InterventionRepository interventionRepository;
    @Autowired
    private final InterventionMapper interventionMapper;
    @Autowired
    private final FailureService failureService;
    @Autowired
    private final UserService userService;
    @Autowired
    private final DocumentService documentService;
    @Autowired
    private final DueDateService  dueDateService;
    @Autowired
    private final NotificationService  notificationService;
    @Autowired
    private final CurrentUserService currentUserService;

    //planifier une intervention
    @Transactional
    public InterventionResponseDto scheduleIntervention(Long failure_id, InterventionRequestDto interventionRequestDto){

        //1.check if failure exist and not resolved
        Failure failure = failureService.getFailureById(failure_id);

        if (failure.getFailureStatus() != FailureStatus.UNRESOLVED) {
            throw new IllegalStateException("La panne est déjà réglé !");
        }

        //2.get entity from dto
        Intervention intervention = interventionMapper.toEntity(interventionRequestDto);

        //3.set attributs
            //get technicien
        User technicien = userService.getUserById(interventionRequestDto.getTechnician_id());

        intervention.setCost(0.0);
        intervention.setFailure(failure);
        intervention.setStatus(InterventionStatus.PLANNED);
        intervention.setTechnician(technicien);

        //4.save intervention to db
        interventionRepository.save(intervention);

        //4.add intervention to user
        userService.addIntervention(technicien, intervention);

        //5.link intervention to failure
        failureService.linkToIntervention(failure, intervention);

        //envoyer notif to technicien
        User sender = currentUserService.getCurrentUser();
        String title = "Planification d'intervention";
        String message = String.format("Vous êtes signalé pour intervenir à la panne du point lumineux %s",
                failure.getLightPoint().getDesignation_fr()
        );
        notificationService.sendDirectNotification(sender, technicien, title, message);

        //4.create a due date
        DueDate dueDate = dueDateService.createDueDate(intervention.getInterventionDate().toLocalDate(),
                "Intervention au panne du point lumineux " + failure.getLightPoint().getId(),
                null, 7, "GET_ALERT_INTERVENTION");

        //5.save all changes
        return interventionMapper.toDto(interventionRepository.save(intervention));

    }

    //démarrer une intervention
    @Transactional
    public InterventionResponseDto startIntervention(Long intervention_id){

        //1.check if intervention exist and not started yet
        Intervention intervention = getInterventionById(intervention_id);
        if (intervention.getStatus() != InterventionStatus.PLANNED) {
            throw new IllegalStateException("L'intervention peut peut etre démarrée ou terminée !");
        }

        //2.update intervention status
        intervention.setStatus(InterventionStatus.IN_PROGRESS);

        //3.save changes
        interventionRepository.save(intervention);

        //send notif to responsible
        //envoyer notif
        List<User> receivers = userService.filterByPermissionName("GET_INTERVENTION_NOTIFICATION");
        User sender = currentUserService.getCurrentUser();
        String title = "Intervention au panne demarré";
        String message = String.format("L'intervention au panne du point lumineux %s a été démarré !",
                intervention.getFailure().getLightPoint().getDesignation_fr()
        );
        for (User receiver : receivers) {
            notificationService.sendDirectNotification(sender, receiver, title, message);
        }

        //return result
        return interventionMapper.toDto(intervention);

    }

    //finir une intervention
    @Transactional
    public Long completeIntervention(Long intervention_id, Double cost, Set<DocumentRequestDto> documentRequestDtos){

        //1.check if intervention exist and in progress
        Intervention intervention = getInterventionById(intervention_id);
        if (intervention.getStatus() != InterventionStatus.IN_PROGRESS) {
            throw new IllegalStateException("L'intervention pas encore démarré !");
        }

        //3.set attributs
            //get documents from dto
        Set<Document> documentList = documentService.getDocumentsFromDtos(documentRequestDtos);
        intervention.setCost(cost);
        intervention.getDocumentSet().addAll(documentList);
        intervention.setStatus(InterventionStatus.COMPLETED);

        interventionRepository.save(intervention);

        //4resolve failure
        failureService.resolveFailure(intervention.getFailure().getId());
        //send notif to responsible
        //envoyer notif
        List<User> receivers = userService.filterByPermissionName("GET_INTERVENTION_NOTIFICATION");
        User sender = currentUserService.getCurrentUser();
        String title = "Intervention au panne terminé";
        String message = String.format("L'intervention au panne du point lumineux %s a été complété !",
                intervention.getFailure().getLightPoint().getDesignation_fr()
        );
        for (User receiver : receivers) {
            notificationService.sendDirectNotification(sender, receiver, title, message);
        }

        //return result
        return intervention.getId();

    }

    //get
    @Transactional
    public InterventionResponseDto getIntervention(Long intervention_id){

        //1.check if Intervention exist
        Intervention intervention = getInterventionById(intervention_id);

        //return result
        return interventionMapper.toDto(intervention);
    }

    //getALL
    @Transactional
    public List<InterventionResponseDto> getAllInterventions(){
        return interventionMapper.toDto(interventionRepository.findAll());
    }

    //get intervention by id
    @Transactional
    public Intervention getInterventionById(Long intervention_id){
        Intervention intervention = interventionRepository.findById(intervention_id)
                .orElseThrow(() -> new IllegalArgumentException("La intervention n'existe pas"));

        return intervention;
    }

    //count interventions by status
    @Transactional
    public Long countAllInterventionsByStatus(InterventionStatus interventionStatus){
        return interventionRepository.countAllByStatus(interventionStatus);
    }

    //search intervention by description, technician or lightpoint
    @Transactional
    public List<Intervention> searchGlobally(String description, Long technicianId, Long lightPointId){

        // Nettoyage des paramètres (vide -> null) pour la requête SQL
        String cleanDescription = (description != null && !description.trim().isEmpty()) ? description.trim() : null;

        //get technician
        User technician = userService.getUserById(technicianId);

        List<Intervention> my_list = interventionRepository.searchInterventions(description, technician);
        List<Intervention> result = new ArrayList<Intervention>();

        for (Intervention in : result){
            if(in.getFailure().getLightPoint().getId().equals(lightPointId)){
                result.add(in);
            }
        }

        return result;

    }

}
