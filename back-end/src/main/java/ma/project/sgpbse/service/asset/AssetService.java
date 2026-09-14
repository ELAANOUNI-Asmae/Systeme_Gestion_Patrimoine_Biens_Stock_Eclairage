package ma.project.sgpbse.service.asset;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.Builder;
import ma.project.sgpbse.dto.asset.request.DocumentRequestDto;
import ma.project.sgpbse.dto.asset.response.AssetResponseDto;
import ma.project.sgpbse.dto.asset.response.DocumentResponseDto;
import ma.project.sgpbse.entity.asset.*;
import ma.project.sgpbse.entity.user.User;
import ma.project.sgpbse.enums.AssetStatus;
import ma.project.sgpbse.exception.asset.AssetNotExistException;
import ma.project.sgpbse.mapper.asset.AssetMapper;
import ma.project.sgpbse.mapper.asset.DocumentMapper;
import ma.project.sgpbse.repository.asset.AssetRepository;
import ma.project.sgpbse.repository.asset.DocumentRepository;
import ma.project.sgpbse.repository.user.UserRepository;
import ma.project.sgpbse.service.NotificationService;
import ma.project.sgpbse.service.user.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Set;

@Service
@Builder
@AllArgsConstructor

public class AssetService {

    @Autowired
    private final AssetRepository assetRepository;
    private final AssetMapper assetMapper;
    @Autowired
    private final DocumentService documentService;
    @Autowired
    private final UserService userService;
    @Autowired
    private final UserRepository userRepository;
    @Autowired
    private final NotificationService notificationService;


    @Transactional
    public String updateStatus(Long id, AssetStatus assetStatus) {
        Asset asset = getAssetById(id);
        AssetStatus oldStatus = asset.getAssetStatus();
        asset.setAssetStatus(assetStatus);
        assetRepository.save(asset);

        return "Successfully updated !";
    }

    @Transactional
    public Long countAllAssets() {
        return assetRepository.count();
    }

    @Transactional
    public Set<DocumentResponseDto> getAllDocuments(Long id) {
        Asset asset = getAssetById(id);
        return documentService.getSetDocumentResponse(asset.getDocuments());
    }

    @Transactional
    public AssetResponseDto getAsset(Long id){
        Asset asset = getAssetById(id);
        return assetMapper.toDto(asset);
    }

    @Transactional
    public List<AssetResponseDto> getAllAssets(){
        return assetMapper.toDtos(assetRepository.findAll());
    }

    @Transactional
    public Asset getAssetById(Long id){
        Asset asset = assetRepository.findById(id)
                .orElseThrow(
                        () -> new AssetNotExistException("Asset doesn't exist !")
                );
        return asset;
    }

    @Transactional
    public void addMaintenanceToAsset(Asset asset, Maintenance maintenance){
        asset.getMaintenanceList().add(maintenance);
        assetRepository.save(asset);
    }

    @Transactional
    public void addRentalToAsset(Asset asset, Rental rental){
        asset.getRentalList().add(rental);
        assetRepository.save(asset);
    }

    //join document
    @Transactional
    public Document joinDoc(Long id, MultipartFile file, DocumentRequestDto documentRequestDto){

        //1.check if accident exist
        Asset asset = getAssetById(id);

        //set target permission
        String targetPermission = "GET_ALERT_ASSET_OFF_DOCS";

        //2.process the doc
        Document document = documentService.createDocument(documentRequestDto, file, targetPermission);

        //3. linking between doc and accident
        documentService.addAsset(document, asset);

        asset.getDocuments().add(document);
        assetRepository.save(asset);

        return document;

    }

    //count by status
    @Transactional
    public Long countAllAssetsByStatus(AssetStatus assetStatus){
        return assetRepository.countByAssetStatus(assetStatus);
    }

    //search asset by designation, inventory_id or assignment
    @Transactional
    public Page<Asset> searchAsset(String query, Pageable pageable){
        return assetRepository.searchGlobally(query, pageable);
    }

    //get all assets by type
    @Transactional
    public List<Asset> findAllByType(String type){
        return assetRepository.findByDiscriminatorValue(type);
    }

    //get all assets by status
    @Transactional
    public List<Asset> findAllByStatus(AssetStatus status){
        return assetRepository.findAllByAssetStatus(status);
    }

    //check if assignment value is null
    @Transactional
    public boolean assignmentIsNull(Long asset_id){
        Asset asset = getAssetById(asset_id);
        return asset.getAssignment() == null
                || asset.getAssignment().isEmpty()
                || asset.getAssignment().isBlank();
    }

    //get archived assets
    @Transactional
    public List<AssetResponseDto> findAllArchived(){
        /*
         * Asset porte @SQLRestriction("asset_status <> 7"), donc les requêtes
         * JPA normales masquent volontairement les biens ARCHIVED.
         * La requête native du repository est utilisée uniquement pour l'archive.
         */
        return assetMapper.toDtos(assetRepository.findAllArchivedAssets());
    }

    //search archived assets by designation or inventory_id
    @Transactional
    public List<Asset> searchArchivedAssets(String designation, String inventoryId) {
        // Nettoyage des paramètres (vide -> null) pour la requête SQL
        String cleanDesignation = (designation != null && !designation.trim().isEmpty()) ? designation.trim() : null;
        String cleanInventoryId = (inventoryId != null && !inventoryId.trim().isEmpty()) ? inventoryId.trim() : null;

        return assetRepository.searchArchivedAssets(cleanDesignation, cleanInventoryId);
    }
}
