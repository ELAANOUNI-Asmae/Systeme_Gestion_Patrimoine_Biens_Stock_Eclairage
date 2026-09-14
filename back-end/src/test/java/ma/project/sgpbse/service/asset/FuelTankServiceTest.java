package ma.project.sgpbse.service.asset;

import ma.project.sgpbse.dto.asset.request.DocumentRequestDto;
import ma.project.sgpbse.dto.asset.request.FuelTankRequestDto;
import ma.project.sgpbse.dto.asset.response.FuelTankResponseDto;
import ma.project.sgpbse.entity.asset.Document;
import ma.project.sgpbse.entity.asset.FuelTank;
import ma.project.sgpbse.entity.asset.Vehicle;
import ma.project.sgpbse.entity.user.User;
import ma.project.sgpbse.exception.asset.FuelTankNotExistException;
import ma.project.sgpbse.mapper.asset.FuelTankMapper;
import ma.project.sgpbse.repository.asset.FuelTankRepository;
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
class FuelTankServiceTest {

    @Mock private FuelTankRepository repository;
    @Mock private FuelTankMapper mapper;
    @Mock private VehicleService vehicleService;
    @Mock private DocumentService<?> documentService;
    @Mock private UserService userService;
    @Mock private NotificationService notificationService;
    @Mock private CurrentUserService currentUserService;
    private FuelTankService service;

    @BeforeEach
    void setUp() {
        service = new FuelTankService(repository, mapper, vehicleService, documentService,
                userService, notificationService, currentUserService);
    }

    @Test
    void shouldRefuelVehicle() {
        Vehicle vehicle = mock(Vehicle.class);
        FuelTank fuelTank = mock(FuelTank.class);
        FuelTankRequestDto dto = mock(FuelTankRequestDto.class);
        when(vehicleService.getVehicleById(1L)).thenReturn(vehicle);
        when(vehicle.getDesignation()).thenReturn("Camion");
        when(mapper.toEntity(dto)).thenReturn(fuelTank);
        when(fuelTank.getId()).thenReturn(8L);
        when(userService.filterByPermissionName("GET_FUEL_TANK_NOTIFICATION")).thenReturn(List.of());
        when(currentUserService.getCurrentUser()).thenReturn(mock(User.class));

        assertEquals(8L, service.refuelVehicle(1L, dto));
        verify(vehicleService).addFuelTankToVehicle(vehicle, fuelTank);
        verify(repository).save(fuelTank);
    }

    @Test
    void shouldGetFuelTank() {
        FuelTank fuelTank = mock(FuelTank.class);
        FuelTankResponseDto response = mock(FuelTankResponseDto.class);
        when(repository.findById(2L)).thenReturn(Optional.of(fuelTank));
        when(mapper.toDto(fuelTank)).thenReturn(response);
        assertSame(response, service.getFuelTank(2L));
    }

    @Test
    void shouldRejectUnknownFuelTank() {
        when(repository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(FuelTankNotExistException.class, () -> service.getFuelTankById(99L));
    }

    @Test
    void shouldGetAllFuelTanks() {
        List<FuelTank> entities = List.of(mock(FuelTank.class));
        List<FuelTankResponseDto> expected = List.of(mock(FuelTankResponseDto.class));
        when(repository.findAll()).thenReturn(entities);
        when(mapper.toDtos(entities)).thenReturn(expected);
        assertEquals(expected, service.getAllFuelTanks());
    }

    @Test
    void shouldJoinDocumentToFuelTank() {
        FuelTank fuelTank = mock(FuelTank.class);
        Document document = mock(Document.class);
        List<Document> docs = new ArrayList<>();
        DocumentRequestDto dto = mock(DocumentRequestDto.class);
        MultipartFile file = mock(MultipartFile.class);
        when(repository.findById(3L)).thenReturn(Optional.of(fuelTank));
        when(fuelTank.getDocList()).thenReturn(docs);
        when(documentService.createDocument(dto, file, "GET_ALERT_FUEL_THANK_OFF_DOCS")).thenReturn(document);

        assertEquals("uploaded successfully !", service.joinDoc(3L, file, dto));
        assertTrue(docs.contains(document));
        verify(documentService).addFuelTank(document, fuelTank);
        verify(repository).save(fuelTank);
    }
}
