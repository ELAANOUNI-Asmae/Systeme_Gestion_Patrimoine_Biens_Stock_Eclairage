package ma.project.sgpbse.service.asset;

import ma.project.sgpbse.dto.asset.request.AccidentRequestDto;
import ma.project.sgpbse.dto.asset.request.DocumentRequestDto;
import ma.project.sgpbse.dto.asset.response.AccidentResponseDto;
import ma.project.sgpbse.entity.asset.Accident;
import ma.project.sgpbse.entity.asset.Document;
import ma.project.sgpbse.entity.asset.Vehicle;
import ma.project.sgpbse.entity.user.User;
import ma.project.sgpbse.enums.AssetStatus;
import ma.project.sgpbse.exception.asset.AssetNotExistException;
import ma.project.sgpbse.mapper.asset.AccidentMapper;
import ma.project.sgpbse.repository.asset.AccidentRepository;
import ma.project.sgpbse.service.NotificationService;
import ma.project.sgpbse.service.user.CurrentUserService;
import ma.project.sgpbse.service.user.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AccidentServiceTest {

    @Mock private AccidentRepository repository;
    @Mock private AccidentMapper mapper;
    @Mock private VehicleService vehicleService;
    @Mock private DocumentService<?> documentService;
    @Mock private UserService userService;
    @Mock private CurrentUserService currentUserService;
    @Mock private NotificationService notificationService;
    private AccidentService service;

    @BeforeEach
    void setUp() {
        service = new AccidentService(repository, mapper, vehicleService, documentService,
                userService, currentUserService, notificationService);
    }

    @Test
    void shouldCreateAccidentAndMarkVehicleDamaged() {
        AccidentRequestDto dto = mock(AccidentRequestDto.class);
        Vehicle vehicle = mock(Vehicle.class);
        Accident accident = mock(Accident.class);
        User sender = mock(User.class);
        when(vehicleService.getVehicleById(1L)).thenReturn(vehicle);
        when(mapper.toEntity(dto)).thenReturn(accident);
        when(accident.getVehicle()).thenReturn(vehicle);
        when(vehicle.getDesignation()).thenReturn("Véhicule communal");
        when(accident.getDriverName()).thenReturn("Conducteur");
        when(accident.getId()).thenReturn(10L);
        when(userService.filterByPermissionName("GET_ACCIDENT_NOTIFICATION")).thenReturn(List.of());
        when(currentUserService.getCurrentUser()).thenReturn(sender);

        assertEquals(10L, service.createAccident(1L, dto));
        verify(vehicleService).updateVehicleStatus(1L, AssetStatus.DAMAGED);
        verify(repository).save(accident);
        verify(vehicleService).addAccidentToVehicle(vehicle, accident);
    }

    @Test
    void shouldGetAccident() {
        Accident accident = mock(Accident.class);
        AccidentResponseDto response = mock(AccidentResponseDto.class);
        when(repository.findById(2L)).thenReturn(Optional.of(accident));
        when(mapper.toDto(accident)).thenReturn(response);
        assertSame(response, service.getAccident(2L));
    }

    @Test
    void shouldRejectUnknownAccident() {
        when(repository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(AssetNotExistException.class, () -> service.getAccidentById(99L));
    }

    @Test
    void shouldGetAllAccidents() {
        List<Accident> entities = List.of(mock(Accident.class));
        List<AccidentResponseDto> expected = List.of(mock(AccidentResponseDto.class));
        when(repository.findAll()).thenReturn(entities);
        when(mapper.toDtos(entities)).thenReturn(expected);
        assertEquals(expected, service.getAllAccidents());
    }

    @Test
    void shouldJoinDocumentToAccident() {
        Accident accident = mock(Accident.class);
        Document document = mock(Document.class);
        List<Document> documents = new ArrayList<>();
        DocumentRequestDto dto = mock(DocumentRequestDto.class);
        MultipartFile file = mock(MultipartFile.class);
        when(repository.findById(3L)).thenReturn(Optional.of(accident));
        when(accident.getDocumentList()).thenReturn(documents);
        when(documentService.createDocument(dto, file, "GET_ALERT_ACCIDENT_OFF_DOCS")).thenReturn(document);

        assertEquals("uploaded successfully !", service.joinDoc(3L, file, dto));
        assertTrue(documents.contains(document));
        verify(documentService).addAccident(document, accident);
        verify(repository).save(accident);
    }
}
