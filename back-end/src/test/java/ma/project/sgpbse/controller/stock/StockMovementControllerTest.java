package ma.project.sgpbse.controller.stock;

import ma.project.sgpbse.dto.asset.request.DocumentRequestDto;
import ma.project.sgpbse.dto.stock.request.StockMovementRequestDto;
import ma.project.sgpbse.dto.stock.response.StockDocumentResponseDto;
import ma.project.sgpbse.dto.stock.response.StockMovementResponseDto;
import ma.project.sgpbse.service.stock.StockMovementService;
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
class StockMovementControllerTest {

    @Mock private StockMovementService service;
    private StockMovementController controller;

    @BeforeEach
    void setUp() {
        controller = new StockMovementController(service);
    }

    @Test
    void shouldDelegateAllStockMovementEndpoints() {
        StockMovementRequestDto request = mock(StockMovementRequestDto.class);
        StockMovementResponseDto movement = mock(StockMovementResponseDto.class);
        StockDocumentResponseDto document = mock(StockDocumentResponseDto.class);
        DocumentRequestDto documentRequest = mock(DocumentRequestDto.class);
        MultipartFile file = mock(MultipartFile.class);

        when(service.getAll()).thenReturn(List.of(movement));
        when(service.getByItem(1L)).thenReturn(List.of(movement));
        when(service.createEntry(1L, request)).thenReturn(movement);
        when(service.createExit(1L, request)).thenReturn(movement);
        when(service.joinDoc(2L, file, documentRequest)).thenReturn(document);

        assertEquals(List.of(movement), controller.getAll().getBody());
        assertEquals(List.of(movement), controller.getByItem(1L).getBody());
        assertSame(movement, controller.entry(1L, request).getBody());
        assertSame(movement, controller.exit(1L, request).getBody());
        assertSame(document, controller.joinDoc(2L, file, documentRequest).getBody());
        assertEquals(HttpStatus.OK, controller.getAll().getStatusCode());

        verify(service).createEntry(1L, request);
        verify(service).createExit(1L, request);
    }
}
