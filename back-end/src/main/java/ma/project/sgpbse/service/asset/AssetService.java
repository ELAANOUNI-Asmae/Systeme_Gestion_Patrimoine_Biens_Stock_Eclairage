package ma.project.sgpbse.service.asset;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.Builder;
import ma.project.sgpbse.dto.asset.request.AssetDtoRequest;
import ma.project.sgpbse.dto.asset.response.AssetDtoResponse;
import ma.project.sgpbse.entity.asset.Asset;
import ma.project.sgpbse.mapper.asset.AssetMapper;
import ma.project.sgpbse.repository.asset.AssetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Builder
@AllArgsConstructor
public class AssetService {

    @Autowired
    private final AssetRepository assetRepository;

    @Autowired
    private final AssetMapper assetMapper;

    @Transactional
    public AssetDtoResponse createAsset(AssetDtoRequest assetDtoRequest){

        //1.Verify that the asset not already exist
        Asset asset = assetRepository.findBy

        //2.Map the request to an asset
        //3.Save the asset to database
        //4.return response
    }

    @Transactional
    public AssetDtoResponse updateAsset(AssetDtoRequest assetDtoRequest, Long asset_id){

    }

    @Transactional
    public Long deleteAsset(Long asset_id){

    }

    @Transactional
    public AssetDtoResponse getAssetInfos(Long asset_id){

    }

    @Transactional
    public List<AssetDtoResponse> getAllAssets(){

    }

}
