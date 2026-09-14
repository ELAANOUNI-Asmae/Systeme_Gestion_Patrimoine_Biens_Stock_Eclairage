package ma.project.sgpbse.service.stock;

import ma.project.sgpbse.dto.asset.request.DocumentRequestDto;
import ma.project.sgpbse.dto.stock.request.ItemRequestDto;
import ma.project.sgpbse.entity.stock.Item;
import ma.project.sgpbse.entity.stock.ItemRequest;
import ma.project.sgpbse.entity.user.User;
import ma.project.sgpbse.enums.ItemRequestStatus;
import ma.project.sgpbse.mapper.stock.ItemRequestMapper;
import ma.project.sgpbse.repository.stock.ItemRequestRepository;
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

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ItemRequestServiceTest {

    @Mock private ItemRequestRepository repository;
    @Mock private ItemRequestMapper mapper;
    @Mock private ItemService itemService;
    @Mock private UserService userService;
    @Mock private OutStockService outStockService;
    @Mock private NotificationService notificationService;
    @Mock private CurrentUserService currentUserService;
    @Mock private DocumentService<?> documentService;

    private ItemRequestService service;

    @BeforeEach
    void setUp() {
        service = new ItemRequestService(repository, mapper, itemService, userService,
                outStockService, notificationService, currentUserService, documentService);
    }

    @Test
    void shouldRejectInvalidRequestedQuantity() {
        ItemRequestDto dto = mock(ItemRequestDto.class);
        when(itemService.getItemById(1L)).thenReturn(mock(Item.class));
        when(dto.getQuantity()).thenReturn(0L);
        assertThrows(IllegalArgumentException.class, () -> service.createItemRequest(1L, dto));
    }

    @Test
    void shouldRejectRequestWhenStockInsufficient() {
        ItemRequestDto dto = mock(ItemRequestDto.class);
        Item item = mock(Item.class);
        when(itemService.getItemById(1L)).thenReturn(item);
        when(dto.getQuantity()).thenReturn(8L);
        when(item.getQuantity()).thenReturn(3L);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> service.createItemRequest(1L, dto));
        assertTrue(ex.getMessage().startsWith("INSUFFICIENT_STOCK"));
    }

    @Test
    void shouldRequireReasonWhenCreatingRequest() {
        ItemRequestDto dto = mock(ItemRequestDto.class);
        Item item = mock(Item.class);
        when(itemService.getItemById(1L)).thenReturn(item);
        when(dto.getQuantity()).thenReturn(2L);
        when(item.getQuantity()).thenReturn(10L);
        when(dto.getReason()).thenReturn("   ");
        assertThrows(IllegalArgumentException.class, () -> service.createItemRequest(1L, dto));
    }

    @Test
    void shouldRejectCancellationByDifferentUser() {
        ItemRequest request = mock(ItemRequest.class);
        User current = mock(User.class);
        when(repository.findById(5L)).thenReturn(Optional.of(request));
        when(request.getProviderId()).thenReturn(10L);
        when(currentUserService.getCurrentUser()).thenReturn(current);
        when(current.getId()).thenReturn(11L);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> service.cancelItemRequest(5L));
        assertEquals("REQUEST_NOT_OWNED", ex.getMessage());
    }

    @Test
    void shouldRejectApprovalOfAlreadyProcessedRequest() {
        ItemRequest request = mock(ItemRequest.class);
        when(repository.findById(5L)).thenReturn(Optional.of(request));
        when(request.getStatus()).thenReturn(ItemRequestStatus.REJECTED);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> service.aprouveItemRequest(5L));
        assertEquals("REQUEST_ALREADY_PROCESSED", ex.getMessage());
    }

    @Test
    void shouldRequireRejectionReason() {
        ItemRequest request = mock(ItemRequest.class);
        when(repository.findById(5L)).thenReturn(Optional.of(request));
        when(request.getStatus()).thenReturn(ItemRequestStatus.PENDING);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> service.rejectItemRequest(5L, "  \"  \"  "));
        assertEquals("REJECTION_REASON_REQUIRED", ex.getMessage());
    }

    @Test
    void shouldRejectDeliveryWhenRequestNotApproved() {
        ItemRequest request = mock(ItemRequest.class);
        User current = mock(User.class);
        when(repository.findById(5L)).thenReturn(Optional.of(request));
        when(request.getProviderId()).thenReturn(10L);
        when(currentUserService.getCurrentUser()).thenReturn(current);
        when(current.getId()).thenReturn(10L);
        when(request.getStatus()).thenReturn(ItemRequestStatus.PENDING);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> service.confirmDelivration(5L));
        assertEquals("REQUEST_NOT_APPROVED", ex.getMessage());
    }

    @Test
    void shouldRejectUnknownRequest() {
        when(repository.findById(404L)).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class, () -> service.getItemRequestById(404L));
    }

    @Test
    void shouldCountRequestsByStatus() {
        when(repository.countByStatus(ItemRequestStatus.PENDING)).thenReturn(4L);
        assertEquals(4L, service.countItemRequestsByStatus(ItemRequestStatus.PENDING));
    }

    @Test
    void shouldReturnEmptyRequestList() {
        when(repository.findAllByOrderByRequestDateDescIdDesc()).thenReturn(List.of());
        assertTrue(service.getAllItemRequests().isEmpty());
    }

    @Test
    void shouldReturnEmptyRequestsByReceiver() {
        when(repository.findAllByProviderId(12L)).thenReturn(List.of());
        assertTrue(service.getAllItemRequestsByReceiver(12L).isEmpty());
        verify(userService).getUserById(12L);
    }

    @Test
    void shouldRejectDocumentForUnknownRequest() {
        when(repository.findById(404L)).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class, () -> service.joinDoc(
                404L, mock(MultipartFile.class), mock(DocumentRequestDto.class)));
    }
}
