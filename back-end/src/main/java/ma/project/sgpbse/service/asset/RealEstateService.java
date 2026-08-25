package ma.project.sgpbse.service.asset;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import ma.project.sgpbse.component.asset.RealEstateCreationFactory;
import ma.project.sgpbse.dto.asset.request.RealEstateRequestDto;
import ma.project.sgpbse.dto.asset.response.RealEstateResponseDto;
import ma.project.sgpbse.dto.asset.response.VehicleResponseDto;
import ma.project.sgpbse.entity.asset.RealEstate;
import ma.project.sgpbse.exception.asset.MachineNotExistException;
import ma.project.sgpbse.exception.asset.RealEstateNotExistException;
import ma.project.sgpbse.mapper.asset.RealEstateMapper;
import ma.project.sgpbse.repository.asset.RealEstateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@AllArgsConstructor

@Service
public class RealEstateService {

    @Autowired
    private final RealEstateRepository realEstateRepository;
    @Autowired
    private final RealEstateMapper realEstateMapper;
    @Autowired
    private final AssetService assetService;


    //create realEstate
    @Transactional
    public RealEstateResponseDto createRealEstate(RealEstateRequestDto realEstateRequestDto){

        //get realEstate from dto
        RealEstate realEstate = realEstateMapper.toEntity(realEstateRequestDto);

        //save it to database
        realEstateRepository.save(realEstate);

        //return response as dto
        return realEstateMapper.toDto(realEstate);
    }

    //update
    public Long updateRealEstate(Long id, RealEstateRequestDto realEstateRequestDto){

        //check if realEstate exist
        RealEstate realEstate = realEstateRepository.findById(id)
                .orElseThrow(
                        () -> new RealEstateNotExistException("Aucune immobilier trouvé !")
                );

        //update realEstate from dto
        realEstateMapper.updateEntityFromDto(realEstateRequestDto, realEstate);

        //save updates
        realEstateRepository.save(realEstate);

        return realEstate.getId();
    }

    //delete
    public String deleteRealEstate(Long id){

        //check if realEstate exist
        RealEstate realEstate = realEstateRepository.findById(id)
                .orElseThrow(
                        () -> new RealEstateNotExistException("Aucune immobilier trouvé !")
                );

        //delete realEstate
        realEstateRepository.deleteById(id);

        return "Successfully deleted !";
    }

    //get
    public RealEstateResponseDto getRealEstate(Long id){

        //check if realEstate exist
        RealEstate realEstate = realEstateRepository.findById(id)
                .orElseThrow(
                        () -> new RealEstateNotExistException("Aucune immobilier trouvé !")
                );

        RealEstateResponseDto dto = realEstateMapper.toDto(realEstate);

        dto.setDocumentResponseDtoSet(assetService.getAllDocuments(realEstate.getId()));

        //return result
        return dto;
    }

    //getAll
    public List<RealEstateResponseDto> getAllRealEstates(){

        return realEstateMapper.toDtos(
                realEstateRepository.findAll()
        );
    }
}
