package ma.project.sgpbse.service.asset;

import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import ma.project.sgpbse.dto.asset.response.DocumentResponseDto;
import ma.project.sgpbse.entity.asset.Asset;
import ma.project.sgpbse.entity.asset.Document;
import ma.project.sgpbse.entity.asset.Maintenance;
import ma.project.sgpbse.entity.asset.Rental;
import ma.project.sgpbse.exception.asset.AssetNotExistException;
import ma.project.sgpbse.mapper.asset.DocumentMapper;
import ma.project.sgpbse.repository.asset.AssetRepository;
import ma.project.sgpbse.repository.asset.DocumentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@AllArgsConstructor
public class DocumentService {

    @Autowired
    private final DocumentRepository documentRepository;
    @Autowired
    private final DocumentMapper documentMapper;
    @Autowired
    private final AssetService assetService;
    @Autowired
    private final MaintenanceService maintenanceService;
    @Autowired
    private final RentalService rentalService;

    private final Path uploadLocation = Paths.get("public/documents");

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(uploadLocation);
        } catch (IOException e) {
            throw new RuntimeException("Impossible de créer le dossier d'upload", e);
        }
    }

    //join asset documents
    @Transactional
    public List<DocumentResponseDto> joinAssetDocs(Long asset_id, List<MultipartFile> files, List<String> titles) {

        // 1. Récupérer le asset
        Asset asset = assetService.getAssetById(asset_id);

        List<Document> savedDocuments = new ArrayList<>();

        for (int i = 0; i < files.size(); i++) {
            MultipartFile file = files.get(i);
            String title = (titles != null && i < titles.size()) ? titles.get(i) : file.getOriginalFilename();

            // 2. Générer un nom de fichier unique pour éviter d'écraser des fichiers existants
            String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path destinationPath = this.uploadLocation.resolve(filename);

            try {
                // 3. Copier/Enregistrer physiquement le fichier sur le disque local
                Files.copy(file.getInputStream(), destinationPath, StandardCopyOption.REPLACE_EXISTING);
            } catch (IOException e) {
                throw new RuntimeException("Échec du stockage du fichier : " + file.getOriginalFilename(), e);
            }

            // 4. Créer l'entité Document et enregistrer la trace en BDD
            Document doc = new Document();
            doc.setTitle(title);
            doc.setPath(destinationPath.toString()); // Chemin complet ou filename
            doc.setAsset(asset);

            savedDocuments.add(documentRepository.save(doc));
        }

        return documentMapper.toDtosList(savedDocuments);
    }

    //join maintenance documents
    @Transactional
    public List<DocumentResponseDto> joinMaintenanceDocs(Long maintenance_id, List<MultipartFile> files, List<String> titles) {

        // 1. get maintenance
        Maintenance maintenance = maintenanceService.getMaintenanceById(maintenance_id);

        List<Document> savedDocuments = new ArrayList<>();

        for (int i = 0; i < files.size(); i++) {
            MultipartFile file = files.get(i);
            String title = (titles != null && i < titles.size()) ? titles.get(i) : file.getOriginalFilename();

            // 2. Générer un nom de fichier unique pour éviter d'écraser des fichiers existants
            String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path destinationPath = this.uploadLocation.resolve(filename);

            try {
                // 3. Copier/Enregistrer physiquement le fichier sur le disque local
                Files.copy(file.getInputStream(), destinationPath, StandardCopyOption.REPLACE_EXISTING);
            } catch (IOException e) {
                throw new RuntimeException("Échec du stockage du fichier : " + file.getOriginalFilename(), e);
            }

            // 4. Créer l'entité Document et enregistrer la trace en BDD
            Document doc = new Document();
            doc.setTitle(title);
            doc.setPath(destinationPath.toString()); // Chemin complet ou filename
            doc.setMaintenance(maintenance);

            savedDocuments.add(documentRepository.save(doc));
        }

        return documentMapper.toDtosList(savedDocuments);
    }

    //join rental documents
    @Transactional
    public List<DocumentResponseDto> joinRentalDocs(Long rental_id, List<MultipartFile> files, List<String> titles) {

        // 1. Récupérer le asset
        Rental rental = rentalService.getRentalById(rental_id);

        List<Document> savedDocuments = new ArrayList<>();

        for (int i = 0; i < files.size(); i++) {
            MultipartFile file = files.get(i);
            String title = (titles != null && i < titles.size()) ? titles.get(i) : file.getOriginalFilename();

            // 2. Générer un nom de fichier unique pour éviter d'écraser des fichiers existants
            String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path destinationPath = this.uploadLocation.resolve(filename);

            try {
                // 3. Copier/Enregistrer physiquement le fichier sur le disque local
                Files.copy(file.getInputStream(), destinationPath, StandardCopyOption.REPLACE_EXISTING);
            } catch (IOException e) {
                throw new RuntimeException("Échec du stockage du fichier : " + file.getOriginalFilename(), e);
            }

            // 4. Créer l'entité Document et enregistrer la trace en BDD
            Document doc = new Document();
            doc.setTitle(title);
            doc.setPath(destinationPath.toString()); // Chemin complet ou filename
            doc.setRental(rental);

            savedDocuments.add(documentRepository.save(doc));
        }

        return documentMapper.toDtosList(savedDocuments);
    }


}
