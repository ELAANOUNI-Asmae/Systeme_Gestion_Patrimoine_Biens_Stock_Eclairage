package ma.project.sgpbse.service.publicLighting;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import ma.project.sgpbse.dto.publicLighting.request.LightPointRequestDto;
import ma.project.sgpbse.dto.publicLighting.response.LightPointResponseDto;
import ma.project.sgpbse.entity.publicLighting.Failure;
import ma.project.sgpbse.entity.publicLighting.LightPoint;
import ma.project.sgpbse.enums.LightPointStatus;
import ma.project.sgpbse.exception.publicLighting.LightPointNotExistException;
import ma.project.sgpbse.mapper.publicLighting.LightPointMapper;
import ma.project.sgpbse.repository.publicLighting.LightPointRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@AllArgsConstructor

@Service
public class LightPointService {

    @Autowired
    private final LightPointRepository lightPointRepository;
    @Autowired
    private final LightPointMapper lightPointMapper;

    //create light point
    @Transactional
    public Long createLightPoint(LightPointRequestDto lightPointRequestDto) throws IllegalAccessException {

        //1.check if light point not exiting before
        String location = lightPointRequestDto.getLocation();

        LightPoint lightPoint = lightPointRepository.findByLocation(location).get();

        if (lightPoint != null) {
            throw new IllegalAccessException("light point already exist !");
        }

        //2.get entity from dto
        lightPoint = lightPointMapper.toEntity(lightPointRequestDto);

        //3.set the status
        lightPoint.setLightPointStatus(LightPointStatus.OPERATIONAL);

        //4.save changes
        lightPointRepository.save(lightPoint);

        return lightPoint.getId();

    }

    //update
    @Transactional
    public LightPoint updateLightPoint(Long lightPoint_id, LightPointRequestDto lightPointRequestDto) {

        //1.check if light point exist
        LightPoint lightPoint = getLightPointById(lightPoint_id);

        //2.update entity from dto
        lightPointMapper.updateEntityFromDto(lightPointRequestDto, lightPoint);

        //3.save changes
        return lightPointRepository.save(lightPoint);
    }

    //delete
    @Transactional
    public Long  deleteLightPoint(Long lightPoint_id) {

        //1.check if light point exist
        LightPoint lightPoint = getLightPointById(lightPoint_id);

        //2.delete light point from db
        lightPointRepository.delete(lightPoint);

        //3.return result
        return lightPoint.getId();
    }

    //update status
    @Transactional
    public Long updateLightPointStatus(Long lightPoint_id, LightPointStatus lightPointStatus) {

        //1.check if light point exist
        LightPoint lightPoint = getLightPointById(lightPoint_id);

        //2.update status
        lightPoint.setLightPointStatus(lightPointStatus);

        //3.save changes
        lightPointRepository.save(lightPoint);

        return lightPoint.getId();
    }

    //get
    @Transactional
    public LightPointResponseDto getLightPoint(Long lightPoint_id) {
        //1.check if light point exist
        LightPoint lightPoint = getLightPointById(lightPoint_id);

        //2.get response dto
        return lightPointMapper.toDto(lightPoint);

    }

    //getAll
    @Transactional
    public List<LightPointResponseDto> getAllLightPoints(){
        return lightPointMapper.toDtos(lightPointRepository.findAll());
    }


    //get light point from id
    @Transactional
    public LightPoint getLightPointById(Long lightPoint_id){
        LightPoint lightPoint = lightPointRepository.findById(lightPoint_id)
                .orElseThrow(() -> new LightPointNotExistException("Light point not found"));

        return lightPoint;
    }

    //get light point by location
    @Transactional
    public LightPoint getLightPointByLocation(String location){

        LightPoint lightPoint = lightPointRepository.findByLocation(location)
                .orElseThrow(() -> new IllegalStateException("Light point already exists"));

        return lightPoint;
    }

    //add failure
    @Transactional
    public void addFailure(LightPoint lightPoint, Failure failure){
        lightPoint.getFailureList().add(failure);
        lightPointRepository.save(lightPoint);
    }

    //count total light points
    @Transactional
    public Long countAllLightPoints(){
        return lightPointRepository.count();
    }

    //get total light points by status
    @Transactional
    public Long countAllLightPointsByStatus(LightPointStatus lightPointStatus){
        return lightPointRepository.countByLightPointStatus(lightPointStatus);
    }

    //filter light points by status
    @Transactional
    public List<LightPoint> filterByStatus(LightPointStatus lightPointStatus){
        return lightPointRepository.findAllByLightPointStatus(lightPointStatus);
    }

    //search by designation fr/ar or location
    @Transactional
    public List<LightPoint> searchGlobally(String designationAr,
                                           String designationFr,
                                           String location){
        // Nettoyage des paramètres (vide -> null) pour la requête SQL
        String cleanDesignationAr = (designationAr != null && !designationAr.trim().isEmpty()) ? designationAr.trim() : null;
        String cleanDesignationFr = (designationFr != null && !designationFr.trim().isEmpty()) ? designationFr.trim() : null;
        String cleanLocation = (location != null && !location.trim().isEmpty()) ? location.trim() : null;
        return lightPointRepository.searchLightPoints(cleanDesignationFr, cleanDesignationAr, cleanLocation);
    }
}
