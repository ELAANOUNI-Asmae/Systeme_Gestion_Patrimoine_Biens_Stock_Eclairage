package ma.project.sgpbse.service.asset;

import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import ma.project.sgpbse.dto.asset.request.DocumentRequestDto;
import ma.project.sgpbse.dto.asset.response.DocumentResponseDto;
import ma.project.sgpbse.entity.DueDate;
import ma.project.sgpbse.entity.asset.*;
import ma.project.sgpbse.entity.stock.InStock;
import ma.project.sgpbse.entity.stock.StockMovement;
import ma.project.sgpbse.enums.DocumentType;
import ma.project.sgpbse.exception.asset.AssetNotExistException;
import ma.project.sgpbse.mapper.asset.DocumentMapper;
import ma.project.sgpbse.repository.asset.AssetRepository;
import ma.project.sgpbse.repository.asset.DocumentRepository;
import ma.project.sgpbse.service.DueDateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@AllArgsConstructor
public class DocumentService<T> {

    @Autowired
    private final DocumentRepository documentRepository;
    @Autowired
    private final DocumentMapper documentMapper;
    @Autowired
    private final DueDateService dueDateService;

    private final Path uploadLocation = Paths.get("public/documents");

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(uploadLocation);
        } catch (IOException e) {
            throw new RuntimeException("Impossible de créer le dossier d'upload", e);
        }
    }
    @Transactional
    public Document createDocument(DocumentRequestDto dto, MultipartFile file, String targetPermission){

        // 1. velidate the rule
        if (dto.getDocumentType() == DocumentType.DOCUMENT_OFFICIEL && dto.getEndDate() == null) {
            throw new IllegalArgumentException("La date d'échéance est obligatoire pour un document OFFICIEL.");
        }

        // 2. generate a unique file name
        String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path destinationPath = this.uploadLocation.resolve(filename);

        try {
            // 3. save the file localy
            Files.copy(file.getInputStream(), destinationPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Échec du stockage du fichier : " + file.getOriginalFilename(), e);
        }

        // 4. get document entity from dto
        Document doc = documentMapper.toEntity(dto);
        doc.setPath(destinationPath.toString());
        documentRepository.save(doc);

        // 5. check if document is officiel
        if (dto.getDocumentType() == DocumentType.DOCUMENT_OFFICIEL) {
            DueDate dueDate = dueDateService.createDueDate(dto.getEndDate(), doc.getTitle_fr()+" "+doc.getTitle_ar(), doc, dto.getAlertThreshold(), targetPermission);
            doc.setDueDate(dueDate);
        }

        return documentRepository.save(doc);
    }

    @Transactional
    public void addAccident(Document document, Accident accident){
        document.setAccident(accident);
        documentRepository.save(document);
    }

    @Transactional
    public void addAsset(Document document, Asset asset){
        document.setAsset(asset);
        documentRepository.save(document);
    }

    @Transactional
    public void addRental(Document document, Rental rental){
        document.setRental(rental);
        documentRepository.save(document);
    }
    @Transactional
    public void addDisposal(Document document, Disposal disposal){
        document.setDisposal(disposal);
        documentRepository.save(document);
    }
    @Transactional
    public void addFuelTank(Document document, FuelTank fuelTank){
        document.setFuelTank(fuelTank);
        documentRepository.save(document);
    }

    @Transactional
    public void addMaintenance(Document document, Maintenance maintenance){
        document.setMaintenance(maintenance);
        documentRepository.save(document);
    }

    @Transactional
    public Set<DocumentResponseDto> getSetDocumentResponse(Set<Document> documentSet){
        return documentMapper.toDtosSet(documentSet);
    }

    @Transactional
    public void addInStock(Document document, InStock inStock){
        document.setInStock(inStock);
        documentRepository.save(document);
    }

    @Transactional
    public Set<Document> getDocumentsFromDtos(Set<DocumentRequestDto> dtos){
        return documentMapper.toEntities(dtos);
    }

}
