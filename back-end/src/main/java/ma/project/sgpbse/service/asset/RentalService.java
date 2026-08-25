package ma.project.sgpbse.service.asset;

import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import ma.project.sgpbse.dto.asset.request.RentalRequestDto;
import ma.project.sgpbse.dto.asset.response.RentalResponseDto;
import ma.project.sgpbse.entity.asset.Asset;
import ma.project.sgpbse.entity.asset.Rental;
import ma.project.sgpbse.enums.AssetStatus;
import ma.project.sgpbse.enums.RentalStatus;
import ma.project.sgpbse.exception.asset.RentalNotExistException;
import ma.project.sgpbse.mapper.asset.RentalMapper;
import ma.project.sgpbse.repository.asset.RentalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Service
@AllArgsConstructor
public class RentalService {

    @Autowired
    private final AssetService assetService;
    @Autowired
    private final RentalRepository rentalRepository;
    @Autowired
    private final RentalMapper rentalMapper;

    //1.rent
    @Transactional
    public Long createRental(Long asset_id, RentalRequestDto rentalRequestDto){

        //1.get asset
        Asset asset = assetService.getAssetById(asset_id);

        //2.check if asset availble
        if (asset.getAssetStatus() != AssetStatus.AVAILABLE) {
            throw new IllegalStateException("Asset is not available");
        }
        //3.get rental entity from dto
        Rental rental = rentalMapper.toEntity(rentalRequestDto);

        //3.save rental
        rentalRepository.save(rental);

        //4.add asset rental
        assetService.addRentalToAsset(asset, rental);

        //5.update asset status
        assetService.updateStatus(asset_id, AssetStatus.RENTED);

        //5.return result
        return rental.getId();
    }

    //2.cancel
    @Transactional
    public String deleteRental(Long id){
        //1.check if rental exist
        Rental rental = getRentalById(id);

        //2.delete it only if his states is not active
        if (rental.getRentalStatus() == RentalStatus.ACTIVE){
            throw new IllegalStateException("Rental is active");
        }

        //3.get asset id
        Long asset_id = rental.getAsset().getId();

        //4.delete rental from db
        rentalRepository.deleteById(id);

        //5.change asset status
        assetService.updateStatus(asset_id, AssetStatus.AVAILABLE);

        return "Success!";
    }

    //3.update
    @Transactional
    public String updateRental(Long id, RentalRequestDto rentalRequestDto){

        //1.check if rental exist
        Rental rental = getRentalById(id);

        //2.update from dto
        rentalMapper.updateEntityFromDto(rentalRequestDto, rental);

        //3.save changes
        rentalRepository.save(rental);

        return "Success!";
    }

    //4.get
    @Transactional
    public RentalResponseDto getRental(Long id){

        //1.check if rental exist
        Rental rental = getRentalById(id);

        return rentalMapper.toDto(rental);
    }

    //5.get all
    @Transactional
    public List<RentalResponseDto> getAllRentals(){
        return  rentalMapper.toDtos(rentalRepository.findAll());
    }

    //get rental by id
    public Rental getRentalById(Long id){
        return rentalRepository.findById(id)
                .orElseThrow(() -> new RentalNotExistException("Rental not found"));
    }

}
