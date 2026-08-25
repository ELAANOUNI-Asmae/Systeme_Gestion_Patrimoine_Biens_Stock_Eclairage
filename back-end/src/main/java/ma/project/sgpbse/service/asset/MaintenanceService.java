package ma.project.sgpbse.service.asset;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import ma.project.sgpbse.dto.asset.request.MaintenanceRequestDto;
import ma.project.sgpbse.dto.asset.response.MaintenanceResponseDto;
import ma.project.sgpbse.entity.asset.Asset;
import ma.project.sgpbse.entity.asset.Maintenance;
import ma.project.sgpbse.enums.AssetStatus;
import ma.project.sgpbse.enums.MaintenanceStatus;
import ma.project.sgpbse.exception.asset.AssetNotExistException;
import ma.project.sgpbse.exception.asset.MaintenanceNotExistException;
import ma.project.sgpbse.mapper.asset.MaintenanceMapper;
import ma.project.sgpbse.repository.asset.AssetRepository;
import ma.project.sgpbse.repository.asset.MaintenanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@AllArgsConstructor
@Service
public class MaintenanceService {

    @Autowired
    private final MaintenanceRepository maintenanceRepository;
    @Autowired
    private final MaintenanceMapper maintenanceMapper;
    @Autowired
    private final AssetService assetService;


    //1.planifier
    @Transactional
    public Long scheduleMaintenance(Long asset_id, MaintenanceRequestDto maintenanceRequestDto){

        //1.get asset
        Asset asset = assetService.getAssetById(asset_id);

        //2.get maintenance entity from dto
        Maintenance maintenance = maintenanceMapper.toEntity(maintenanceRequestDto);

        //3.set default state
        maintenance.setMaintenanceStatus(MaintenanceStatus.PLANNED);

        //4.save maintenace to db
        maintenanceRepository.save(maintenance);

        //5.add maintenance to asset
        assetService.addMaintenanceToAsset(asset, maintenance);

        //update asset status
        assetService.updateStatus(asset_id, AssetStatus.DAMAGED);

        //7.return maintenance id
        return maintenance.getId();
    }

    //2.commencer
    @Transactional
    public String startMaintenance(Long maintenance_id){

        //1.check if maintenance exist
        Maintenance maintenance = maintenanceRepository.findById(maintenance_id)
                .orElseThrow(
                        () -> new MaintenanceNotExistException("Asset Not Exist Exception"));

        //2.verify that the maintenance has not canceled
        //2.check status
        if (maintenance.getMaintenanceStatus() !=  MaintenanceStatus.PLANNED) {
            throw new RuntimeException("you cannot cancel this maintenance !");
        }

        //2.fix start date to now
        maintenance.setStartDate(LocalDate.now());

        //3.update status
        maintenance.setMaintenanceStatus(MaintenanceStatus.IN_PROGRESS);

        //get asset_id
        Long asset_id = maintenance.getAsset().getId();

        //update asset status
        assetService.updateStatus(asset_id, AssetStatus.UNDER_MAINTENANCE);

        //4.save changes to db
        maintenanceRepository.save(maintenance);

        //5.return result
        return "Maintenance successfully started ! ";
    }

    //3.finir
    @Transactional
    public MaintenanceResponseDto completeMaintenance(Long maintenance_id, Double cost){

        //1.check if maintenance exist
        Maintenance maintenance = maintenanceRepository.findById(maintenance_id)
                .orElseThrow(
                        () -> new MaintenanceNotExistException("Asset Not Exist Exception"));

        //2.check status
        if (maintenance.getMaintenanceStatus() !=  MaintenanceStatus.PLANNED) {
            throw new RuntimeException("you cannot cancel this maintenance !");
        }

        //2.fix end date to now
        maintenance.setEndDate(LocalDate.now());

        //3.update status
        maintenance.setMaintenanceStatus(MaintenanceStatus.COMPLETED);

        //4.set cost
        maintenance.setCost(cost);

        //get asset id
        Long asset_id = maintenance.getAsset().getId();

        //update asset status
        assetService.updateStatus(asset_id, AssetStatus.AVAILABLE);

        //5.save changes to db
        maintenanceRepository.save(maintenance);

        //6.print report
        return maintenanceMapper.toDto(maintenance);
    }

    //update
    @Transactional
    public String updateMaintenance(Long maintenance_id, MaintenanceRequestDto maintenanceRequestDto){

        //1.check if maintenance exist
        Maintenance maintenance = maintenanceRepository.findById(maintenance_id)
                .orElseThrow(
                        () -> new MaintenanceNotExistException("Asset Not Exist Exception"));

        //2.check status
        if (maintenance.getMaintenanceStatus() !=  MaintenanceStatus.PLANNED) {
            throw new RuntimeException("you cannot cancel this maintenance !");
        }

        //2.update from dto
        maintenanceMapper.updateEntityFromDto(maintenanceRequestDto, maintenance);

        return "successfully updated !";
    }

    //delete
    @Transactional
    public Long deleteMaintenance(Long maintenance_id){

        //1.check if maintenance exist
        Maintenance maintenance = maintenanceRepository.findById(maintenance_id)
                .orElseThrow(
                        () -> new MaintenanceNotExistException("Asset Not Exist Exception"));

        //get asset id
        Long asset_id = maintenance.getAsset().getId();

        //2.Delete maintenance from db
        maintenanceRepository.deleteById(maintenance_id);

        //update asset status
        assetService.updateStatus(asset_id, AssetStatus.AVAILABLE);

        //3.print report
        return maintenance_id;
    }

    //cancel
    @Transactional
    public String cancelMaintenance(Long maintenance_id){

        //1.check if maintenance exist
        Maintenance maintenance = maintenanceRepository.findById(maintenance_id)
                .orElseThrow(
                        () -> new MaintenanceNotExistException("Asset Not Exist Exception"));

        //2.check status
        if (maintenance.getMaintenanceStatus() !=  MaintenanceStatus.PLANNED) {
            throw new RuntimeException("you cannot cancel this maintenance !");
        }

        //3.change status to canceled
        maintenance.setMaintenanceStatus(MaintenanceStatus.CANCELLED);

        //4.return result
        return "successfuly canceled !";
    }

    //get
    @Transactional
    public MaintenanceResponseDto getMaintenance(Long maintenance_id){

        //1.check if maintenance exist
        Maintenance maintenance = maintenanceRepository.findById(maintenance_id)
                .orElseThrow(
                        () -> new MaintenanceNotExistException("Asset Not Exist Exception"));

        return maintenanceMapper.toDto(maintenance);
    }

    //4.getAll
    @Transactional
    public List<MaintenanceResponseDto> getAllMaintenances(){

        return maintenanceMapper.toDtoList(
                maintenanceRepository.findAll()
        );
    }

    //5.updatestatus
    @Transactional
    public String updateMaintenanceStatus(Long maintenance_id, String status){

        //1.check if maintenance exist
        Maintenance maintenance = maintenanceRepository.findById(maintenance_id)
                .orElseThrow(
                        () -> new MaintenanceNotExistException("Asset Not Exist Exception"));

        //2.updat status
        maintenance.setMaintenanceStatus(MaintenanceStatus.valueOf(status));

        //3.save changes to db
        maintenanceRepository.save(maintenance);

        //6.print report
        return "successfully updated !";
    }

    //get maintenance by id
    @Transactional
    public Maintenance getMaintenanceById(Long maintenance_id){
        return maintenanceRepository.findById(maintenance_id)
                .orElseThrow(
                        () -> new MaintenanceNotExistException("Asset Not Exist Exception")
                );
    }

}
