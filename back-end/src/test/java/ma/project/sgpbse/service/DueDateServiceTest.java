package ma.project.sgpbse.service;

import ma.project.sgpbse.entity.DueDate;
import ma.project.sgpbse.entity.asset.Document;
import ma.project.sgpbse.repository.DueDateRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DueDateServiceTest {

    @Mock private DueDateRepository dueDateRepository;
    @Mock private Document document;

    private DueDateService service;

    @BeforeEach
    void setUp() {
        service = new DueDateService(dueDateRepository);
        when(dueDateRepository.save(any(DueDate.class))).thenAnswer(i -> i.getArgument(0));
    }

    @Test
    void shouldCreateFutureDueDate() {
        LocalDate endDate = LocalDate.now().plusDays(7);
        DueDate result = service.createDueDate(endDate, "Assurance", document, 10, "GET_ASSET_INFOS");

        assertEquals(7L, result.getMargin());
        assertTrue(result.getMessage().contains("expire dans 7 jour(s)"));
        assertEquals(10, result.getThresholdDays());
        assertEquals("GET_ASSET_INFOS", result.getTargetPermission());
        assertSame(document, result.getDocument());
    }

    @Test
    void shouldCreateUrgentMessageForToday() {
        DueDate result = service.createDueDate(LocalDate.now(), "Contrat", document, 5, "P");
        assertEquals(0L, result.getMargin());
        assertTrue(result.getMessage().contains("expire aujourd'hui"));
    }

    @Test
    void shouldCreateCriticalMessageForExpiredDate() {
        DueDate result = service.createDueDate(LocalDate.now().minusDays(3), "Document", document, 5, "P");
        assertEquals(-3L, result.getMargin());
        assertTrue(result.getMessage().contains("expiré depuis 3 jour(s)"));
    }

    @Test
    void shouldUseDefaultThresholdWhenNull() {
        DueDate result = service.createDueDate(LocalDate.now().plusDays(2), "Document", document, null, "P");
        assertEquals(30, result.getThresholdDays());
        verify(dueDateRepository).save(result);
    }
}
