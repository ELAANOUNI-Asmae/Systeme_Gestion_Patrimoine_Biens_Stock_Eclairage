package ma.project.sgpbse.service.asset;

import ma.project.sgpbse.dto.asset.request.DocumentRequestDto;
import ma.project.sgpbse.dto.asset.response.DocumentResponseDto;
import ma.project.sgpbse.entity.asset.*;
import ma.project.sgpbse.entity.publicLighting.Failure;
import ma.project.sgpbse.entity.publicLighting.Intervention;
import ma.project.sgpbse.entity.publicLighting.LightPoint;
import ma.project.sgpbse.entity.stock.InStock;
import ma.project.sgpbse.entity.stock.Item;
import ma.project.sgpbse.entity.stock.ItemRequest;
import ma.project.sgpbse.entity.stock.StockMovement;
import ma.project.sgpbse.enums.DocumentType;
import ma.project.sgpbse.mapper.asset.DocumentMapper;
import ma.project.sgpbse.repository.asset.DocumentRepository;
import ma.project.sgpbse.service.DueDateService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DocumentServiceTest {

    @Mock private DocumentRepository repository;
    @Mock private DocumentMapper mapper;
    @Mock private DueDateService dueDateService;
    private DocumentService<Object> service;

    @BeforeEach
    void setUp() {
        service = new DocumentService<>(repository, mapper, dueDateService);
    }

    @Test
    void shouldRejectOfficialDocumentWithoutEndDate() {
        DocumentRequestDto dto = mock(DocumentRequestDto.class);
        MultipartFile file = mock(MultipartFile.class);
        when(dto.getDocumentType()).thenReturn(DocumentType.DOCUMENT_OFFICIEL);
        when(dto.getEndDate()).thenReturn(null);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> service.createDocument(dto, file, "GET_ASSET_INFOS"));
        assertTrue(ex.getMessage().contains("date d'échéance"));
        verifyNoInteractions(repository);
    }

    @Test
    void shouldGetDocumentById() {
        Document document = mock(Document.class);
        when(repository.findById(1L)).thenReturn(Optional.of(document));
        assertSame(document, service.getDocumentById(1L));
    }

    @Test
    void shouldRejectUnknownDocument() {
        when(repository.findById(99L)).thenReturn(Optional.empty());
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.getDocumentById(99L));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    void shouldRejectDocumentWithBlankPath() {
        Document document = mock(Document.class);
        when(repository.findById(2L)).thenReturn(Optional.of(document));
        when(document.getPath()).thenReturn("   ");
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.getDocumentFilePath(2L));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    void shouldMapDocumentSets() {
        Set<Document> docs = Set.of(mock(Document.class));
        Set<DocumentResponseDto> expected = Set.of(mock(DocumentResponseDto.class));
        when(mapper.toDtosSet(docs)).thenReturn(expected);
        assertEquals(expected, service.getSetDocumentResponse(docs));
    }

    @Test
    void shouldMapDocumentRequestDtosToEntities() {
        Set<DocumentRequestDto> dtos = Set.of(mock(DocumentRequestDto.class));
        Set<Document> expected = Set.of(mock(Document.class));
        when(mapper.toEntities(dtos)).thenReturn(expected);
        assertEquals(expected, service.getDocumentsFromDtos(dtos));
    }

    @Test
    void shouldAttachDocumentToAssetDomainObjects() {
        Document document = mock(Document.class);
        Accident accident = mock(Accident.class);
        Asset asset = mock(Asset.class);
        Rental rental = mock(Rental.class);
        Disposal disposal = mock(Disposal.class);
        FuelTank fuelTank = mock(FuelTank.class);
        Maintenance maintenance = mock(Maintenance.class);
        InStock inStock = mock(InStock.class);

        service.addAccident(document, accident);
        service.addAsset(document, asset);
        service.addRental(document, rental);
        service.addDisposal(document, disposal);
        service.addFuelTank(document, fuelTank);
        service.addMaintenance(document, maintenance);
        service.addInStock(document, inStock);

        verify(document).setAccident(accident);
        verify(document).setAsset(asset);
        verify(document).setRental(rental);
        verify(document).setDisposal(disposal);
        verify(document).setFuelTank(fuelTank);
        verify(document).setMaintenance(maintenance);
        verify(document).setInStock(inStock);
        verify(repository, times(7)).save(document);
    }

    @Test
    void shouldAttachDocumentToStockDomainObjects() {
        Document document = mock(Document.class);
        Item item = mock(Item.class);
        ItemRequest request = mock(ItemRequest.class);
        StockMovement movement = mock(StockMovement.class);

        service.addItem(document, item);
        service.addItemRequest(document, request);
        service.addStockMovement(document, movement);

        verify(document).setItem(item);
        verify(document).setItemRequest(request);
        verify(document).setStockMovement(movement);
        verify(repository, times(3)).save(document);
    }

    @Test
    void shouldAttachDocumentToLightingDomainObjects() {
        Document document = mock(Document.class);
        LightPoint lightPoint = mock(LightPoint.class);
        Failure failure = mock(Failure.class);
        Intervention intervention = mock(Intervention.class);

        service.addLightPoint(document, lightPoint);
        service.addFailure(document, failure);
        service.addIntervention(document, intervention);

        verify(document).setLightPoint(lightPoint);
        verify(document).setFailure(failure);
        verify(document).setIntervention(intervention);
        verify(repository, times(3)).save(document);
    }

    @Test
    void shouldDeleteDocumentFromDatabaseWhenNoFilePath() {
        Document document = mock(Document.class);
        when(repository.findById(6L)).thenReturn(Optional.of(document));
        when(document.getPath()).thenReturn(null);

        service.deleteDocument(6L);
        verify(repository).delete(document);
    }
}
