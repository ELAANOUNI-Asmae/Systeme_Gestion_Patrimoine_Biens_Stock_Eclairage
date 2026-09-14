package ma.project.sgpbse.controller.stock;

import ma.project.sgpbse.dto.asset.request.DocumentRequestDto;
import ma.project.sgpbse.dto.stock.request.ItemReqDto;
import ma.project.sgpbse.dto.stock.response.ItemResDto;
import ma.project.sgpbse.dto.stock.response.StockDocumentResponseDto;
import ma.project.sgpbse.entity.stock.ItemStatistics;
import ma.project.sgpbse.service.stock.ItemService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ItemControllerTest {

    @Mock private ItemService service;
    private ItemController controller;

    @BeforeEach
    void setUp() {
        controller = new ItemController(service);
    }

    @Test
    void shouldDelegateItemCrudSearchStatisticsAndDocuments() {
        ItemReqDto request = mock(ItemReqDto.class);
        ItemResDto item = mock(ItemResDto.class);
        ItemStatistics statistics = mock(ItemStatistics.class);
        StockDocumentResponseDto document = mock(StockDocumentResponseDto.class);
        DocumentRequestDto documentRequest = mock(DocumentRequestDto.class);
        MultipartFile file = mock(MultipartFile.class);

        when(service.createItem(request)).thenReturn(item);
        when(service.deleteItem(1L)).thenReturn(1L);
        when(service.updateItem(1L, request)).thenReturn(item);
        when(service.getItem(1L)).thenReturn(item);
        when(service.getAllItems()).thenReturn(List.of(item));
        when(service.getItemStatBySerialNumber(1L)).thenReturn(statistics);
        when(service.countAllItems()).thenReturn(4L);
        when(service.countTotalQuantities()).thenReturn(25L);
        when(service.searchItem("SN", "Lampe", "Brand")).thenReturn(List.of(item));
        when(service.filterByLowStockStatus()).thenReturn(List.of(item));
        when(service.countTotalMovementPerArticle(1L)).thenReturn(3);
        when(service.joinDoc(1L, file, documentRequest)).thenReturn(document);

        assertSame(item, controller.createItem(request).getBody());
        assertEquals(1L, controller.deleteItem(1L).getBody());
        assertSame(item, controller.updateItem(1L, request).getBody());
        assertEquals(HttpStatus.NO_CONTENT, controller.updateItemQuantity(1L, 50L).getStatusCode());
        assertSame(item, controller.getItem(1L).getBody());
        assertEquals(List.of(item), controller.getAllItems().getBody());
        assertSame(statistics, controller.getItemStatBySerialNumber(1L).getBody());
        assertEquals(4L, controller.countTotalItems().getBody());
        assertEquals(25L, controller.countTotalQuantities().getBody());
        assertEquals(List.of(item), controller.searchItem("SN", "Lampe", "Brand").getBody());
        assertEquals(List.of(item), controller.lowItems().getBody());
        assertEquals(3, controller.countTotalMovementPerArticle(1L).getBody());
        assertSame(document, controller.uploadDocument(1L, file, documentRequest).getBody());
        assertEquals(HttpStatus.NO_CONTENT, controller.deleteDocument(1L, 9L).getStatusCode());

        verify(service).updateItemQuantity(1L, 50L);
        verify(service).deleteDocument(1L, 9L);
    }
}
