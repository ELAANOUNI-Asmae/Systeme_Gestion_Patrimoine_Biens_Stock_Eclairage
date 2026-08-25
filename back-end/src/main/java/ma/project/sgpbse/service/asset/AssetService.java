package ma.project.sgpbse.service.asset;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.Builder;
import ma.project.sgpbse.dto.asset.request.DocumentRequestDto;
import ma.project.sgpbse.dto.asset.response.AssetResponseDto;
import ma.project.sgpbse.dto.asset.response.DocumentResponseDto;
import ma.project.sgpbse.entity.asset.*;
import ma.project.sgpbse.enums.AssetStatus;
import ma.project.sgpbse.exception.asset.AssetNotExistException;
import ma.project.sgpbse.mapper.asset.AssetMapper;
import ma.project.sgpbse.mapper.asset.DocumentMapper;
import ma.project.sgpbse.repository.asset.AssetRepository;
import ma.project.sgpbse.repository.asset.DocumentRepository;
import org.springframework.beans.factory.annotation.Autowired;
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


    @Transactional
    public String updateStatus(Long id, AssetStatus assetStatus) {
        Asset asset = getAssetById(id);
        asset.setAssetStatus(assetStatus);
        assetRepository.save(asset);
        return "Successfully updated !";
    }

    @Transactional
    public Long count() {
        return this.assetRepository.count();
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

    @Transactional
    public void addDocument(Asset asset, Document document){
        asset.getDocuments().add(document);
        assetRepository.save(asset);
    }

    //join document
    @Transactional
    public String joinDoc(Long id, MultipartFile file, DocumentRequestDto documentRequestDto){

        //1.check if accident exist
        Asset asset = getAssetById(id);

        //2.process the doc
        Document document = documentService.createDocument(documentRequestDto, file);

        //3. linking between doc and accident
        documentService.addAsset(document, asset);

        asset.getDocuments().add(document);
        assetRepository.save(asset);

        return "uploaded successfully !";

    }

}
