package ma.project.sgpbse.service.stock;

import ma.project.sgpbse.dto.stock.response.ItemResDto;
import ma.project.sgpbse.entity.stock.Item;
import ma.project.sgpbse.exception.stock.ItemNotExistException;
import ma.project.sgpbse.mapper.stock.ItemMapper;
import ma.project.sgpbse.repository.stock.ItemRepository;
import ma.project.sgpbse.service.asset.DocumentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ItemServiceTest {

    @Mock private ItemRepository itemRepository;
    @Mock private ItemMapper itemMapper;
    @Mock private LowStockAlertService lowStockAlertService;
    @Mock private DocumentService<?> documentService;

    private ItemService service;

    @BeforeEach
    void setUp() {
        service = new ItemService(itemRepository, itemMapper, lowStockAlertService, documentService);
    }

    @Test
    void shouldCountItemsAndQuantities() {
        when(itemRepository.count()).thenReturn(8L);
        when(itemRepository.sumTotalQuantity()).thenReturn(120L);

        assertEquals(8L, service.countAllItems());
        assertEquals(120L, service.countTotalQuantities());
    }

    @Test
    void shouldRejectNegativeQuantityUpdate() {
        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> service.updateItemQuantity(1L, -1L)
        );
        assertEquals("INVALID_QUANTITY", ex.getMessage());
        verifyNoInteractions(itemRepository);
    }

    @Test
    void shouldRejectUnknownItem() {
        when(itemRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(ItemNotExistException.class, () -> service.getItemById(99L));
    }

    @Test
    void shouldRejectRemovingMoreThanAvailableStock() {
        Item item = new Item();
        item.setId(1L);
        item.setQuantity(3L);
        when(itemRepository.findById(1L)).thenReturn(Optional.of(item));

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> service.removeQuantity(1L, 5L)
        );
        assertEquals("INSUFFICIENT_STOCK:3", ex.getMessage());
        verify(itemRepository, never()).save(any());
    }

    @Test
    void shouldRemoveQuantityAndRecheckLowStock() {
        Item item = new Item();
        item.setId(1L);
        item.setQuantity(10L);
        when(itemRepository.findById(1L)).thenReturn(Optional.of(item));

        service.removeQuantity(1L, 4L);

        assertEquals(6L, item.getQuantity());
        verify(itemRepository).save(item);
        verify(lowStockAlertService).checkAndManageStockAlert(item);
    }

    @Test
    void shouldTrimSearchFiltersBeforeFilteringItems() {
        Item item = new Item();
        item.setId(2L);
        item.setSerialNumber("ABC");
        item.setName("Chaise");
        item.setBrand("Mobilier");

        ItemResDto dto = new ItemResDto();
        when(itemRepository.findAll()).thenReturn(List.of(item));
        when(itemMapper.toDto(item)).thenReturn(dto);

        List<ItemResDto> result = service.searchItem("  ABC  ", "  Chaise ", "   ");

        assertEquals(1, result.size());
        assertSame(dto, result.get(0));
        verify(itemRepository).findAll();
        verify(itemMapper).toDto(item);
    }
}
