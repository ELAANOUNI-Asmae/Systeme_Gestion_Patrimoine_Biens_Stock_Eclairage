package ma.project.sgpbse.component.asset;

import ma.project.sgpbse.dto.asset.request.AssetRequestDto;
import ma.project.sgpbse.entity.asset.Asset;

import java.time.LocalDate;

public abstract class AssetCreationFactory<T extends Asset, D extends AssetRequestDto>{
    public abstract T createEntity(D dto);
}
