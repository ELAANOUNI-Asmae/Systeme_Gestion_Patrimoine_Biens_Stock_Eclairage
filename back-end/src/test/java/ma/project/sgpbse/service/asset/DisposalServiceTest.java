package ma.project.sgpbse.service.asset;

import ma.project.sgpbse.dto.asset.request.DisposalRequestDto;
import ma.project.sgpbse.dto.asset.request.DocumentRequestDto;
import ma.project.sgpbse.dto.asset.response.DisposalResponseDto;
import ma.project.sgpbse.entity.asset.Asset;
import ma.project.sgpbse.entity.asset.Disposal;
import ma.project.sgpbse.entity.asset.Document;
import ma.project.sgpbse.entity.user.User;
import ma.project.sgpbse.enums.AssetStatus;
import ma.project.sgpbse.exception.asset.DisposalNotExistException;
import ma.project.sgpbse.mapper.asset.DisposalMapper;
import ma.project.sgpbse.repository.asset.DisposalRepository;
import ma.project.sgpbse.service.NotificationService;
import ma.project.sgpbse.service.user.CurrentUserService;
import ma.project.sgpbse.service.user.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DisposalServiceTest {

    @Mock private DisposalRepository repository;
    @Mock private DisposalMapper mapper;
    @Mock private AssetService assetService;
    @Mock private DocumentService<?> documentService;
    @Mock private UserService userService;
    @Mock private NotificationService notificationService;
    @Mock private CurrentUserService currentUserService;
    private DisposalService service;

    @BeforeEach
    void setUp() {
        service = new DisposalService(repository, mapper, assetService, documentService,
                userService, notificationService, currentUserService);
    }

    @Test
    void shouldRejectDisposalOfInUseAsset() {
        Asset asset = mock(Asset.class);
        when(assetService.getAssetById(1L)).thenReturn(asset);
        when(asset.getAssetStatus()).thenReturn(AssetStatus.IN_USE);
        assertThrows(IllegalStateException.class,
                () -> service.createDisposal(1L, mock(DisposalRequestDto.class)));
    }

    @Test
    void shouldCreateDisposalForAvailableAsset() {
        Asset asset = mock(Asset.class);
        Disposal disposal = mock(Disposal.class);
        User sender = mock(User.class);
        DisposalRequestDto dto = mock(DisposalRequestDto.class);
        when(assetService.getAssetById(1L)).thenReturn(asset);
        when(asset.getAssetStatus()).thenReturn(AssetStatus.AVAILABLE);
        when(asset.getDesignation()).thenReturn("Ordinateur");
        when(mapper.toEntity(dto)).thenReturn(disposal);
        when(disposal.getId()).thenReturn(7L);
        when(userService.filterByPermissionName("GET_DISPOSAL_NOTIFICATION")).thenReturn(List.of());
        when(currentUserService.getCurrentUser()).thenReturn(sender);

        assertEquals(7L, service.createDisposal(1L, dto));
        verify(disposal).setAsset(asset);
        verify(asset).setDisposal(disposal);
        verify(repository).save(disposal);
        verify(assetService).updateStatus(1L, AssetStatus.DISPOSED);
    }

    @Test
    void shouldGetDisposal() {
        Disposal disposal = mock(Disposal.class);
        DisposalResponseDto response = mock(DisposalResponseDto.class);
        when(repository.findById(2L)).thenReturn(Optional.of(disposal));
        when(mapper.toDto(disposal)).thenReturn(response);
        assertSame(response, service.getDisposal(2L));
    }

    @Test
    void shouldRejectUnknownDisposal() {
        when(repository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(DisposalNotExistException.class, () -> service.getDisposalById(99L));
    }

    @Test
    void shouldGetAllDisposals() {
        List<Disposal> entities = List.of(mock(Disposal.class));
        List<DisposalResponseDto> expected = List.of(mock(DisposalResponseDto.class));
        when(repository.findAll()).thenReturn(entities);
        when(mapper.toDtos(entities)).thenReturn(expected);
        assertEquals(expected, service.getAllDisposals());
    }

    @Test
    void shouldJoinDocumentToDisposal() {
        Disposal disposal = mock(Disposal.class);
        Document document = mock(Document.class);
        List<Document> documents = new ArrayList<>();
        DocumentRequestDto dto = mock(DocumentRequestDto.class);
        MultipartFile file = mock(MultipartFile.class);
        when(repository.findById(3L)).thenReturn(Optional.of(disposal));
        when(disposal.getAsset()).thenReturn(null);
        when(disposal.getDocumentList()).thenReturn(documents);
        when(documentService.createDocument(dto, file, "GET_ALERT_DISPOSAL_OFF_DOCS")).thenReturn(document);

        assertEquals("uploaded successfully !", service.joinDoc(3L, file, dto));
        assertTrue(documents.contains(document));
        verify(documentService).addDisposal(document, disposal);
        verify(repository).save(disposal);
    }
}
