package ma.project.sgpbse.service.asset;

import ma.project.sgpbse.entity.asset.Asset;
import ma.project.sgpbse.enums.AssetStatus;
import ma.project.sgpbse.exception.asset.AssetNotExistException;
import ma.project.sgpbse.mapper.asset.AssetMapper;
import ma.project.sgpbse.repository.asset.AssetRepository;
import ma.project.sgpbse.repository.user.UserRepository;
import ma.project.sgpbse.service.NotificationService;
import ma.project.sgpbse.service.user.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AssetServiceTest {

    @Mock private AssetRepository assetRepository;
    @Mock private AssetMapper assetMapper;
    @Mock private DocumentService<?> documentService;
    @Mock private UserService userService;
    @Mock private UserRepository userRepository;
    @Mock private NotificationService notificationService;

    private AssetService service;

    @BeforeEach
    void setUp() {
        service = new AssetService(
                assetRepository,
                assetMapper,
                documentService,
                userService,
                userRepository,
                notificationService
        );
    }

    @Test
    void shouldCountAssets() {
        when(assetRepository.count()).thenReturn(15L);
        assertEquals(15L, service.countAllAssets());
    }

    @Test
    void shouldCountAssetsByStatus() {
        when(assetRepository.countByAssetStatus(AssetStatus.AVAILABLE)).thenReturn(9L);
        assertEquals(9L, service.countAllAssetsByStatus(AssetStatus.AVAILABLE));
    }

    @Test
    void shouldRejectUnknownAsset() {
        when(assetRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(AssetNotExistException.class, () -> service.getAssetById(99L));
    }

    @Test
    void shouldUpdateAssetStatus() {
        Asset asset = mock(Asset.class);
        when(assetRepository.findById(2L)).thenReturn(Optional.of(asset));

        assertEquals("Successfully updated !", service.updateStatus(2L, AssetStatus.UNDER_MAINTENANCE));

        verify(asset).setAssetStatus(AssetStatus.UNDER_MAINTENANCE);
        verify(assetRepository).save(asset);
    }

    @Test
    void shouldDetectBlankAssignment() {
        Asset asset = mock(Asset.class);
        when(assetRepository.findById(3L)).thenReturn(Optional.of(asset));
        when(asset.getAssignment()).thenReturn("   ");
        assertTrue(service.assignmentIsNull(3L));
    }

    @Test
    void shouldDetectNonBlankAssignment() {
        Asset asset = mock(Asset.class);
        when(assetRepository.findById(4L)).thenReturn(Optional.of(asset));
        when(asset.getAssignment()).thenReturn("Service Informatique");
        assertFalse(service.assignmentIsNull(4L));
    }
}
