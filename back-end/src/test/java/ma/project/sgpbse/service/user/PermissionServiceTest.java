package ma.project.sgpbse.service.user;

import ma.project.sgpbse.entity.user.Permission;
import ma.project.sgpbse.exception.user.PermissionNotExistException;
import ma.project.sgpbse.repository.user.PermissionRepository;
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
class PermissionServiceTest {

    @Mock private PermissionRepository repository;
    private PermissionService service;

    @BeforeEach
    void setUp() {
        service = new PermissionService(repository);
    }

    @Test
    void shouldGetPermissionById() {
        Permission permission = mock(Permission.class);
        when(repository.findById(1L)).thenReturn(Optional.of(permission));
        assertSame(permission, service.getPermissionById(1L));
    }

    @Test
    void shouldRejectUnknownPermission() {
        when(repository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(PermissionNotExistException.class, () -> service.getPermissionById(99L));
    }

    @Test
    void shouldGetPermissionsByIds() {
        List<Long> ids = List.of(1L, 2L);
        List<Permission> expected = List.of(mock(Permission.class), mock(Permission.class));
        when(repository.findAllById(ids)).thenReturn(expected);
        assertEquals(expected, service.getAllPermissionsByIds(ids));
    }

    @Test
    void shouldGetPermissionByName() {
        Permission permission = mock(Permission.class);
        when(repository.findByName("CREATE_USER")).thenReturn(permission);
        assertSame(permission, service.getPermissionByName("CREATE_USER"));
    }

    @Test
    void shouldGetAllPermissions() {
        List<Permission> expected = List.of(mock(Permission.class));
        when(repository.findAll()).thenReturn(expected);
        assertEquals(expected, service.getAllPermissions());
    }
}
