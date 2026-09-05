package ma.project.sgpbse.service.asset;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import ma.project.sgpbse.dto.asset.request.DisposalRequestDto;
import ma.project.sgpbse.dto.asset.request.DocumentRequestDto;
import ma.project.sgpbse.dto.asset.response.DisposalResponseDto;
import ma.project.sgpbse.entity.asset.Accident;
import ma.project.sgpbse.entity.asset.Asset;
import ma.project.sgpbse.entity.asset.Disposal;
import ma.project.sgpbse.entity.asset.Document;
import ma.project.sgpbse.entity.user.User;
import ma.project.sgpbse.enums.AssetStatus;
import ma.project.sgpbse.exception.asset.DisposalNotExistException;
import ma.project.sgpbse.mapper.asset.DisposalMapper;
import ma.project.sgpbse.repository.asset.DisposalRepository;
import ma.project.sgpbse.repository.user.UserRepository;
import ma.project.sgpbse.service.NotificationService;
import ma.project.sgpbse.service.user.CurrentUserService;
import ma.project.sgpbse.service.user.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@AllArgsConstructor

@Service
public class DisposalService {

    @Autowired
    private final DisposalRepository disposalRepository;
    @Autowired
    private final DisposalMapper disposalMapper;
    @Autowired
    private final AssetService assetService;
    @Autowired
    private final DocumentService documentService;
    @Autowired
    private final UserService userService;
    @Autowired
    private final NotificationService notificationService;
    @Autowired
    private final CurrentUserService currentUserService;

    //disposeAsset()
    @Transactional
    public Long createDisposal(Long asset_id, DisposalRequestDto disposalRequestDto){

        //1.check if asset exist
        Asset asset = assetService.getAssetById(asset_id);

        //2.check asset status
        if (asset.getAssetStatus() == AssetStatus.IN_USE || asset.getAssetStatus() == AssetStatus.RENTED){
            throw new IllegalStateException("Asset could not be disposed");
        }

        //3.get disposal entity from dto
        Disposal disposal = disposalMapper.toEntity(disposalRequestDto);

        //4.save it to db
        disposalRepository.save(disposal);

        //5.change asset status
        assetService.updateStatus(asset_id, AssetStatus.DISPOSED);

        //envoyer une notif
        List<User> receivers = userService.filterByPermissionName("GET_DISPOSAL_NOTIFICATION");
        User sender = currentUserService.getCurrentUser();
        String title = "Cession d'un bien";
        String message = String.format("Le bien %s a été cédé !",
                asset.getDesignation()
        );
        for (User receiver : receivers) {
            notificationService.sendDirectNotification(sender, receiver, title, message);
        }

        //6.return result
        return disposal.getId();

    }


    //get
    @Transactional
    public DisposalResponseDto getDisposal(Long disposal_id){

        //1.Check if disposal exist
        Disposal disposal = getDisposalById(disposal_id);

        //2.return result
        return disposalMapper.toDto(disposal);

    }

    //getAll
    @Transactional
    public List<DisposalResponseDto> getAllDisposals(){
        return disposalMapper.toDtos(disposalRepository.findAll());
    }

    //join document
    @Transactional
    public String joinDoc(Long id, MultipartFile file, DocumentRequestDto documentRequestDto){

        //1.check if accident exist
        Disposal disposal = getDisposalById(id);

        //set target permission
        String targetPermission = "GET_ALERT_DISPOSAL_OFF_DOCS";

        //2.process the doc
        Document document = documentService.createDocument(documentRequestDto, file, targetPermission);

        //3. linking between doc and accident
        documentService.addDisposal(document, disposal);

        disposal.getDocumentList().add(document);
        disposalRepository.save(disposal);

        return "uploaded successfully !";

    }

    @Transactional
    public Disposal getDisposalById(Long id){
        Disposal disposal = disposalRepository.findById(id).orElseThrow(
                () -> new DisposalNotExistException("Disposal with id " + id + " not found")
        );

        return disposal;
    }
}
