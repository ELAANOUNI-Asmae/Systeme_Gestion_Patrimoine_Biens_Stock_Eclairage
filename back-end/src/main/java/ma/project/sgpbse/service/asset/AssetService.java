package ma.project.sgpbse.service.asset;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.Builder;
import ma.project.sgpbse.dto.asset.response.AssetResponseDto;
import ma.project.sgpbse.dto.asset.response.DocumentResponseDto;
import ma.project.sgpbse.entity.asset.Asset;
import ma.project.sgpbse.entity.asset.Document;
import ma.project.sgpbse.entity.asset.Maintenance;
import ma.project.sgpbse.entity.asset.Rental;
import ma.project.sgpbse.enums.AssetStatus;
import ma.project.sgpbse.exception.asset.AssetNotExistException;
import ma.project.sgpbse.mapper.asset.AssetMapper;
import ma.project.sgpbse.mapper.asset.DocumentMapper;
import ma.project.sgpbse.repository.asset.AssetRepository;
import ma.project.sgpbse.repository.asset.DocumentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
@Builder
@AllArgsConstructor

public class AssetService {

    @Autowired
    private final AssetRepository assetRepository;
    @Autowired
    private final DocumentRepository documentRepository;
    @Autowired
    private final DocumentMapper documentMapper;
    @Autowired
    private final AssetMapper assetMapper;


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
        Set<Document> documents = asset.getDocuments();
        return documentMapper.toDtosSet(documents);
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

}
