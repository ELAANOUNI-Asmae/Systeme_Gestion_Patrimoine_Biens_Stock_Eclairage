package ma.project.sgpbse.service.stock;

import ma.project.sgpbse.dto.asset.request.DocumentRequestDto;
import ma.project.sgpbse.dto.stock.request.InStockRequestDto;
import ma.project.sgpbse.dto.stock.response.InStockResponseDto;
import ma.project.sgpbse.entity.stock.InStock;
import ma.project.sgpbse.entity.stock.Item;
import ma.project.sgpbse.entity.user.User;
import ma.project.sgpbse.mapper.stock.InStockMapper;
import ma.project.sgpbse.repository.stock.InStockRepository;
import ma.project.sgpbse.service.NotificationService;
import ma.project.sgpbse.service.asset.DocumentService;
import ma.project.sgpbse.service.user.CurrentUserService;
import ma.project.sgpbse.service.user.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InStockServiceTest {

    @Mock private InStockRepository repository;
    @Mock private InStockMapper mapper;
    @Mock private ItemService itemService;
    @Mock private DocumentService<?> documentService;
    @Mock private UserService userService;
    @Mock private NotificationService notificationService;
    @Mock private CurrentUserService currentUserService;

    private InStockService service;

    @BeforeEach
    void setUp() {
        service = new InStockService(repository, mapper, itemService, documentService,
                userService, notificationService, currentUserService);
    }

    @Test
    void shouldCountInStockByItem() {
        when(repository.countByItemId(4L)).thenReturn(6L);
        assertEquals(6L, service.countByItem(4L));
        verify(itemService).getItem(4L);
    }

    @Test
    void shouldCountTotalInStock() {
        when(repository.count()).thenReturn(12L);
        assertEquals(12L, service.countTotalInStock());
    }

    @Test
    void shouldCountInStockByPeriod() {
        when(repository.countByMouvementDateAfter(any(LocalDate.class))).thenReturn(3L);
        assertEquals(3L, service.countTotalInStockByPeriod(7L));
    }

    @Test
    void shouldRejectInvalidUnitPrice() {
        Item item = mock(Item.class);
        InStock inStock = new InStock();
        inStock.setUnitEntryPrice(0.0);
        inStock.setQuantity(2L);
        when(itemService.getItemById(1L)).thenReturn(item);
        when(mapper.toEntity(any(InStockRequestDto.class))).thenReturn(inStock);

        assertThrows(IllegalArgumentException.class, () -> service.saveInStock(
                1L, mock(InStockRequestDto.class), List.of(), List.of()));
    }

    @Test
    void shouldRejectInvalidQuantity() {
        Item item = mock(Item.class);
        InStock inStock = new InStock();
        inStock.setUnitEntryPrice(10.0);
        inStock.setQuantity(0L);
        when(itemService.getItemById(1L)).thenReturn(item);
        when(mapper.toEntity(any(InStockRequestDto.class))).thenReturn(inStock);

        assertThrows(IllegalArgumentException.class, () -> service.saveInStock(
                1L, mock(InStockRequestDto.class), List.of(), List.of()));
    }

    @Test
    void shouldSaveValidInStockOperation() {
        Item item = mock(Item.class);
        User sender = mock(User.class);
        InStock inStock = new InStock();
        inStock.setUnitEntryPrice(100.0);
        inStock.setQuantity(2L);
        inStock.setVat(20);
        InStockResponseDto response = mock(InStockResponseDto.class);

        when(itemService.getItemById(1L)).thenReturn(item);
        when(item.getName()).thenReturn("Lampe LED");
        when(mapper.toEntity(any(InStockRequestDto.class))).thenReturn(inStock);
        when(mapper.toDto(inStock)).thenReturn(response);
        when(repository.save(any(InStock.class))).thenAnswer(i -> i.getArgument(0));
        when(userService.filterByPermissionName("GET_INSTOCK_NOTIFICATION")).thenReturn(List.of());
        when(currentUserService.getCurrentUser()).thenReturn(sender);

        assertSame(response, service.saveInStock(1L, mock(InStockRequestDto.class), List.of(), List.of()));
        assertEquals(200.0, inStock.getTotalExcludingTax());
        assertEquals(240.0, inStock.getTotalIncludingTax());
        verify(itemService).addItems(1L, 2L);
        verify(itemService).addStockMovement(1L, inStock);
        verify(repository, times(2)).save(inStock);
    }

    @Test
    void shouldRejectMismatchedFilesAndDtos() {
        InStock inStock = new InStock();
        inStock.setUnitEntryPrice(10.0);
        inStock.setQuantity(1L);
        inStock.setVat(20);
        when(itemService.getItemById(1L)).thenReturn(mock(Item.class));
        when(mapper.toEntity(any(InStockRequestDto.class))).thenReturn(inStock);

        assertThrows(IllegalArgumentException.class, () -> service.saveInStock(
                1L,
                mock(InStockRequestDto.class),
                List.of(mock(MultipartFile.class)),
                List.<DocumentRequestDto>of()
        ));
    }
}
