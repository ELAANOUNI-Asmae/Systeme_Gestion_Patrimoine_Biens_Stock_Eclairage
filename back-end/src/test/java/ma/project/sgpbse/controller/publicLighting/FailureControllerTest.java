package ma.project.sgpbse.controller.publicLighting;

import ma.project.sgpbse.dto.asset.request.DocumentRequestDto;
import ma.project.sgpbse.dto.publicLighting.request.FailureRequestDto;
import ma.project.sgpbse.dto.publicLighting.response.FailureResponseDto;
import ma.project.sgpbse.dto.publicLighting.response.LightingDocumentResponseDto;
import ma.project.sgpbse.dto.publicLighting.response.PublicFailureSummaryDto;
import ma.project.sgpbse.service.publicLighting.FailureService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FailureControllerTest {

    @Mock private FailureService service;
    private FailureController controller;

    @BeforeEach
    void setUp() {
        controller = new FailureController(service);
    }

    @Test
    void shouldDelegateFailureEndpointsIncludingPublicReporting() {
        FailureRequestDto request = mock(FailureRequestDto.class);
        FailureResponseDto failure = mock(FailureResponseDto.class);
        PublicFailureSummaryDto publicSummary = mock(PublicFailureSummaryDto.class);
        LightingDocumentResponseDto document = mock(LightingDocumentResponseDto.class);
        DocumentRequestDto documentRequest = mock(DocumentRequestDto.class);
        MultipartFile file = mock(MultipartFile.class);

        when(service.reportFailure(request)).thenReturn(failure);
        when(service.reportFailureByLightId(1L, request)).thenReturn(failure);
        when(service.getPublicOpenFailures()).thenReturn(List.of(publicSummary));
        when(service.getFailure(2L)).thenReturn(failure);
        when(service.getAllFailures()).thenReturn(List.of(failure));
        when(service.joinDoc(2L, file, documentRequest)).thenReturn(document);

        assertSame(failure, controller.report(request).getBody());
        assertSame(failure, controller.reportById(1L, request).getBody());
        assertSame(failure, controller.publicReport(1L, request).getBody());
        assertEquals(List.of(publicSummary), controller.publicOpen().getBody());
        assertSame(failure, controller.get(2L).getBody());
        assertEquals(List.of(failure), controller.all().getBody());
        assertSame(document, controller.joinDoc(2L, file, documentRequest).getBody());
        assertSame(document, controller.publicJoinDoc(2L, file, documentRequest).getBody());

        verify(request).setReportedBy("PUBLIC");
        verify(service, times(2)).joinDoc(2L, file, documentRequest);
    }
}
