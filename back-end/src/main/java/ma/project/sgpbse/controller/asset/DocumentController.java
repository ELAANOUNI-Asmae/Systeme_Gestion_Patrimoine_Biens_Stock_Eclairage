package ma.project.sgpbse.controller.asset;

import lombok.RequiredArgsConstructor;
import ma.project.sgpbse.entity.asset.Document;
import ma.project.sgpbse.repository.asset.DocumentRepository;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/sgpbse/document")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentRepository documentRepository;

    @GetMapping("/{documentId}/content")
    public ResponseEntity<Resource> openDocument(
            @PathVariable Long documentId
    ) throws IOException {

        Document document = documentRepository
                .findById(documentId)
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "Document introuvable !"
                        )
                );

        if (document.getPath() == null || document.getPath().isBlank()) {
            return ResponseEntity.notFound().build();
        }

        Path path = Paths
                .get(document.getPath())
                .toAbsolutePath()
                .normalize();

        if (!Files.exists(path) || !Files.isRegularFile(path)) {
            return ResponseEntity.notFound().build();
        }

        Resource resource;

        try {
            resource = new UrlResource(path.toUri());
        } catch (MalformedURLException exception) {
            throw new IllegalStateException(
                    "Chemin du document invalide.",
                    exception
            );
        }

        String contentType = Files.probeContentType(path);

        if (contentType == null || contentType.isBlank()) {
            contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
        }

        String contentDisposition = ContentDisposition
                .inline()
                .filename(
                        path.getFileName().toString(),
                        StandardCharsets.UTF_8
                )
                .build()
                .toString();

        return ResponseEntity
                .ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        contentDisposition
                )
                .contentLength(Files.size(path))
                .body(resource);
    }
}