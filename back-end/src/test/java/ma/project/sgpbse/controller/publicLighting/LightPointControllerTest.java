package ma.project.sgpbse.controller.publicLighting;

import ma.project.sgpbse.dto.asset.request.DocumentRequestDto;
import ma.project.sgpbse.dto.publicLighting.request.LightPointRequestDto;
import ma.project.sgpbse.dto.publicLighting.response.LightPointResponseDto;
import ma.project.sgpbse.dto.publicLighting.response.LightingDocumentResponseDto;
import ma.project.sgpbse.enums.LightPointStatus;
import ma.project.sgpbse.service.publicLighting.LightPointService;
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
class LightPointControllerTest {

    @Mock private LightPointService service;
    private LightPointController controller;

    @BeforeEach
    void setUp() {
        controller = new LightPointController(service);
    }

    @Test
    void shouldDelegateLightingEndpointsIncludingPublicEndpoint() {
        LightPointRequestDto request = mock(LightPointRequestDto.class);
        LightPointResponseDto light = mock(LightPointResponseDto.class);
        LightingDocumentResponseDto document = mock(LightingDocumentResponseDto.class);
        DocumentRequestDto documentRequest = mock(DocumentRequestDto.class);
        MultipartFile file = mock(MultipartFile.class);

        when(service.createLightPoint(request)).thenReturn(1L);
        when(service.updateLightPoint(1L, request)).thenReturn(light);
        when(service.deleteLightPoint(1L)).thenReturn(1L);
        LightPointStatus status = LightPointStatus.values()[0];
        when(service.updateLightPointStatus(1L, status)).thenReturn(1L);
        when(service.getLightPoint(1L)).thenReturn(light);
        when(service.getAllLightPoints()).thenReturn(List.of(light));
        when(service.getPublicLightPoints()).thenReturn(List.of(light));
        when(service.countAllLightPointsByStatus(status)).thenReturn(2L);
        when(service.filterByStatus(status)).thenReturn(List.of(light));
        when(service.searchGlobally("مصباح", "Lampe", "Agadir")).thenReturn(List.of(light));
        when(service.joinDoc(1L, file, documentRequest)).thenReturn(document);

        assertEquals(1L, controller.create(request).getBody());
        assertSame(light, controller.update(1L, request).getBody());
        assertEquals(1L, controller.delete(1L).getBody());
        assertEquals(1L, controller.status(1L, status).getBody());
        assertSame(light, controller.get(1L).getBody());
        assertEquals(List.of(light), controller.all().getBody());
        assertEquals(List.of(light), controller.publicAll().getBody());
        assertEquals(2L, controller.count(status).getBody());
        assertEquals(List.of(light), controller.filter(status).getBody());
        assertEquals(List.of(light), controller.search("مصباح", "Lampe", "Agadir").getBody());
        assertSame(document, controller.joinDoc(1L, file, documentRequest).getBody());
        assertEquals(HttpStatus.NO_CONTENT, controller.deleteDoc(1L, 7L).getStatusCode());

        verify(service).deleteDocument(1L, 7L);
    }
}
