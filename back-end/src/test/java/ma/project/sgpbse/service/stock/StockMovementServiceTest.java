package ma.project.sgpbse.service.stock;

import ma.project.sgpbse.dto.asset.request.DocumentRequestDto;
import ma.project.sgpbse.dto.stock.request.StockMovementRequestDto;
import ma.project.sgpbse.entity.stock.Item;
import ma.project.sgpbse.entity.stock.StockMovement;
import ma.project.sgpbse.entity.user.User;
import ma.project.sgpbse.repository.stock.StockMovementRepository;
import ma.project.sgpbse.service.asset.DocumentService;
import ma.project.sgpbse.service.user.CurrentUserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class StockMovementServiceTest {

    @Mock private StockMovementRepository repository;
    @Mock private ItemService itemService;
    @Mock private CurrentUserService currentUserService;
    @Mock private DocumentService<?> documentService;

    private StockMovementService service;

    @BeforeEach
    void setUp() {
        service = new StockMovementService(repository, itemService, currentUserService, documentService);
    }

    @Test
    void shouldCountMovementsByPeriod() {
        when(repository.countByMouvementDateAfter(any(LocalDate.class))).thenReturn(9L);
        assertEquals(9L, service.countAllStockMovementByPeriod(30L));
    }

    @Test
    void shouldGetAllMovementsWhenRepositoryEmpty() {
        when(repository.findAllByOrderByMouvementDateDescIdDesc()).thenReturn(List.of());
        assertTrue(service.getAll().isEmpty());
    }

    @Test
    void shouldGetMovementsByItemWhenRepositoryEmpty() {
        when(repository.findByItemIdOrderByMouvementDateDescIdDesc(3L)).thenReturn(List.of());
        assertTrue(service.getByItem(3L).isEmpty());
        verify(itemService).getItemById(3L);
    }

    @Test
    void shouldRejectInvalidQuantity() {
        StockMovementRequestDto dto = mock(StockMovementRequestDto.class);
        when(dto.getQuantity()).thenReturn(0L);
        assertThrows(IllegalArgumentException.class, () -> service.createEntry(1L, dto));
    }

    @Test
    void shouldRejectBlankReason() {
        StockMovementRequestDto dto = mock(StockMovementRequestDto.class);
        when(dto.getQuantity()).thenReturn(1L);
        when(dto.getReason()).thenReturn("   ");
        assertThrows(IllegalArgumentException.class, () -> service.createExit(1L, dto));
    }

    @Test
    void shouldRejectInvalidEntryPrice() {
        StockMovementRequestDto dto = mock(StockMovementRequestDto.class);
        when(dto.getQuantity()).thenReturn(1L);
        when(dto.getReason()).thenReturn("Réapprovisionnement");
        when(dto.getUnitPriceHt()).thenReturn(0.0);
        when(dto.getVatRate()).thenReturn(20.0);
        assertThrows(IllegalArgumentException.class, () -> service.createEntry(1L, dto));
    }

    @Test
    void shouldRejectExitWhenStockInsufficient() {
        StockMovementRequestDto dto = mock(StockMovementRequestDto.class);
        Item item = mock(Item.class);
        when(dto.getQuantity()).thenReturn(5L);
        when(dto.getReason()).thenReturn("Sortie service");
        when(itemService.getItemById(1L)).thenReturn(item);
        when(item.getQuantity()).thenReturn(2L);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> service.createExit(1L, dto));
        assertTrue(ex.getMessage().startsWith("INSUFFICIENT_STOCK"));
    }

    @Test
    void shouldCreateEntryAndUpdateItemStock() {
        StockMovementRequestDto dto = mock(StockMovementRequestDto.class);
        Item item = mock(Item.class);
        User user = mock(User.class);

        when(dto.getQuantity()).thenReturn(2L);
        when(dto.getReason()).thenReturn(" Achat ");
        when(dto.getUnitPriceHt()).thenReturn(100.0);
        when(dto.getVatRate()).thenReturn(20.0);
        when(dto.getSupplierOrBeneficiary()).thenReturn(" Fournisseur ");
        when(dto.getReference()).thenReturn(" REF-1 ");
        when(dto.getDate()).thenReturn(LocalDate.now());
        when(itemService.getItemById(1L)).thenReturn(item);
        when(item.getId()).thenReturn(1L);
        when(item.getName()).thenReturn("Lampe LED");
        when(item.getDesignationAr()).thenReturn("مصباح");
        when(item.getPrice()).thenReturn(90.0);
        when(item.getVatRate()).thenReturn(20.0);
        when(currentUserService.getCurrentUser()).thenReturn(user);
        when(user.getFirstname_fr()).thenReturn("Fatima");
        when(user.getLastname_fr()).thenReturn("Zahra");
        when(repository.save(any(StockMovement.class))).thenAnswer(i -> i.getArgument(0));

        assertNotNull(service.createEntry(1L, dto));
        verify(itemService).applyEntry(1L, 2L, 100.0, 20.0);
    }

    @Test
    void shouldCreateExitAndRemoveQuantity() {
        StockMovementRequestDto dto = mock(StockMovementRequestDto.class);
        Item item = mock(Item.class);
        User user = mock(User.class);

        when(dto.getQuantity()).thenReturn(2L);
        when(dto.getReason()).thenReturn(" Affectation ");
        when(dto.getSupplierOrBeneficiary()).thenReturn("Service Technique");
        when(dto.getReference()).thenReturn("OUT-1");
        when(itemService.getItemById(1L)).thenReturn(item);
        when(item.getQuantity()).thenReturn(10L);
        when(item.getId()).thenReturn(1L);
        when(item.getName()).thenReturn("Câble");
        when(item.getDesignationAr()).thenReturn("كابل");
        when(item.getPrice()).thenReturn(12.0);
        when(item.getVatRate()).thenReturn(20.0);
        when(currentUserService.getCurrentUser()).thenReturn(user);
        when(user.getFirstname_fr()).thenReturn("Agent");
        when(user.getLastname_fr()).thenReturn("Stock");
        when(repository.save(any(StockMovement.class))).thenAnswer(i -> i.getArgument(0));

        assertNotNull(service.createExit(1L, dto));
        verify(itemService).removeQuantity(1L, 2L);
    }

    @Test
    void shouldRejectUnknownMovementWhenJoiningDocument() {
        when(repository.findById(404L)).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class, () -> service.joinDoc(
                404L, mock(MultipartFile.class), mock(DocumentRequestDto.class)));
    }
}

