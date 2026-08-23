package ma.project.sgpbse.service.asset;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import ma.project.sgpbse.dto.asset.request.DisposalRequestDto;
import ma.project.sgpbse.dto.asset.response.DisposalResponseDto;
import ma.project.sgpbse.entity.asset.Asset;
import ma.project.sgpbse.entity.asset.Disposal;
import ma.project.sgpbse.enums.AssetStatus;
import ma.project.sgpbse.exception.asset.DisposalNotExistException;
import ma.project.sgpbse.mapper.asset.DisposalMapper;
import ma.project.sgpbse.repository.asset.DisposalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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

        //6.return result
        return disposal.getId();

    }


    //get
    @Transactional
    public DisposalResponseDto getDisposal(Long disposal_id){

        //1.Check if disposal exist
        Disposal disposal = disposalRepository.findById(disposal_id).orElseThrow(
                () -> new DisposalNotExistException("Disposal with id " + disposal_id + " not found")
        );

        //2.return result
        return disposalMapper.toDto(disposal);

    }

    //getAll
    @Transactional
    public List<DisposalResponseDto> getAllDisposals(){
        return disposalMapper.toDtos(disposalRepository.findAll());
    }
}
