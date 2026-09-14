package ma.project.sgpbse.service.asset;

import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import ma.project.sgpbse.dto.asset.request.DocumentRequestDto;
import ma.project.sgpbse.dto.asset.response.DocumentResponseDto;
import ma.project.sgpbse.entity.DueDate;
import ma.project.sgpbse.entity.asset.*;
import ma.project.sgpbse.entity.stock.InStock;
import ma.project.sgpbse.entity.stock.Item;
import ma.project.sgpbse.entity.stock.ItemRequest;
import ma.project.sgpbse.entity.stock.StockMovement;
import ma.project.sgpbse.entity.publicLighting.LightPoint;
import ma.project.sgpbse.entity.publicLighting.Failure;
import ma.project.sgpbse.entity.publicLighting.Intervention;
import ma.project.sgpbse.enums.DocumentType;
import ma.project.sgpbse.exception.asset.AssetNotExistException;
import ma.project.sgpbse.mapper.asset.DocumentMapper;
import ma.project.sgpbse.repository.asset.AssetRepository;
import ma.project.sgpbse.repository.asset.DocumentRepository;
import ma.project.sgpbse.service.DueDateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
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


    @Transactional
    public Document getDocumentById(Long id) {
        return documentRepository.findById(id)
                .orElseThrow(
                        () -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Document with id " + id + " not found"
                        )
                );
    }

    @Transactional
    public Path getDocumentFilePath(Long id) {
        Document document = getDocumentById(id);

        if (document.getPath() == null || document.getPath().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Document file path is empty"
            );
        }

        Path basePath = uploadLocation
                .toAbsolutePath()
                .normalize();

        Path documentPath = Paths
                .get(document.getPath())
                .toAbsolutePath()
                .normalize();

        // Never serve a file outside public/documents.
        if (!documentPath.startsWith(basePath)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Invalid document path"
            );
        }

        if (!Files.exists(documentPath) || !Files.isRegularFile(documentPath)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Document file not found"
            );
        }

        return documentPath;
    }


    @Transactional
    public void addItem(Document document, Item item) {
        document.setItem(item);
        documentRepository.save(document);
    }

    @Transactional
    public void addItemRequest(Document document, ItemRequest request) {
        document.setItemRequest(request);
        documentRepository.save(document);
    }

    @Transactional
    public void addStockMovement(Document document, StockMovement movement) {
        document.setStockMovement(movement);
        documentRepository.save(document);
    }

    @Transactional
    public void deleteDocument(Long id) {
        Document document = getDocumentById(id);
        if (document.getPath() != null && !document.getPath().isBlank()) {
            try {
                Files.deleteIfExists(Paths.get(document.getPath()));
            } catch (IOException ignored) {
                // La suppression DB reste prioritaire; le fichier pourra être nettoyé plus tard.
            }
        }
        documentRepository.delete(document);
    }

    @Transactional
    public void addLightPoint(Document document, LightPoint lightPoint) {
        document.setLightPoint(lightPoint);
        documentRepository.save(document);
    }

    @Transactional
    public void addFailure(Document document, Failure failure) {
        document.setFailure(failure);
        documentRepository.save(document);
    }

    @Transactional
    public void addIntervention(Document document, Intervention intervention) {
        document.setIntervention(intervention);
        documentRepository.save(document);
    }

}
