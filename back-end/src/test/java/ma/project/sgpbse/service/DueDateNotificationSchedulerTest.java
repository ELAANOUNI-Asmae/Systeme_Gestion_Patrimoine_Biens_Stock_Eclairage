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
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DueDateNotificationSchedulerTest {

    @Mock private DueDateRepository dueDateRepository;
    @Mock private NotificationService notificationService;

    private DueDateNotificationScheduler scheduler;

    @BeforeEach
    void setUp() {
        scheduler = new DueDateNotificationScheduler(dueDateRepository, notificationService);
    }

    @Test
    void shouldSendDailyReminderInsideThreshold() {
        DueDate dueDate = dueDate(LocalDate.now().plusDays(3), 7, "GET_ALERT_STOCK_MVMT_OFF_DOCS");
        when(dueDateRepository.findAll()).thenReturn(List.of(dueDate));

        scheduler.processDueDateNotifications();

        assertEquals(3L, dueDate.getMargin());
        assertFalse(dueDate.getTreated());
        assertTrue(dueDate.getMessage().contains("expire dans 3 jour(s)"));
        verify(notificationService).notifyUsersWithPermission(
                "GET_ALERT_STOCK_MVMT_OFF_DOCS",
                "Alerte Échéance Document",
                dueDate.getMessage()
        );
        verify(dueDateRepository).saveAll(List.of(dueDate));
    }

    @Test
    void shouldSendUrgentReminderOnDeadlineDay() {
        DueDate dueDate = dueDate(LocalDate.now(), 7, "GET_ALERT_MAINTENANCE_OFF_DOCS");
        when(dueDateRepository.findAll()).thenReturn(List.of(dueDate));

        scheduler.processDueDateNotifications();

        assertEquals(0L, dueDate.getMargin());
        assertTrue(dueDate.getMessage().contains("expire aujourd'hui"));
        verify(notificationService).notifyUsersWithPermission(
                eq("GET_ALERT_MAINTENANCE_OFF_DOCS"),
                eq("Alerte Échéance Document"),
                contains("expire aujourd'hui")
        );
    }

    @Test
    void shouldNotSpamAfterExpiration() {
        DueDate dueDate = dueDate(LocalDate.now().minusDays(2), 7, "GET_ALERT_STOCK_MVMT_OFF_DOCS");
        when(dueDateRepository.findAll()).thenReturn(List.of(dueDate));

        scheduler.processDueDateNotifications();

        assertEquals(-2L, dueDate.getMargin());
        assertTrue(dueDate.getMessage().contains("expiré depuis 2 jour(s)"));
        verifyNoInteractions(notificationService);
        verify(dueDateRepository).saveAll(List.of(dueDate));
    }

    private DueDate dueDate(LocalDate endDate, int threshold, String permission) {
        Document document = new Document();
        document.setTitle_fr("Assurance véhicule");
        return DueDate.builder()
                .endDate(endDate)
                .thresholdDays(threshold)
                .targetPermission(permission)
                .document(document)
                .treated(false)
                .build();
    }
}
