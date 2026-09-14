package ma.project.sgpbse.service.user;

import ma.project.sgpbse.dto.user.request.RoleRequestDto;
import ma.project.sgpbse.entity.user.Permission;
import ma.project.sgpbse.entity.user.Role;
import ma.project.sgpbse.exception.user.RoleAlreadyExistException;
import ma.project.sgpbse.exception.user.RoleNotExistException;
import ma.project.sgpbse.mapper.user.RoleMapper;
import ma.project.sgpbse.repository.user.RoleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RoleServiceTest {

    @Mock private RoleRepository roleRepository;
    @Mock private PermissionService permissionService;
    @Mock private RoleMapper roleMapper;

    private RoleService service;

    @BeforeEach
    void setUp() {
        service = new RoleService(roleRepository, permissionService, roleMapper);
    }

    @Test
    void shouldRejectDuplicateRole() {
        RoleRequestDto dto = dto("ADMIN", List.of(1L));
        when(roleRepository.findByName("ADMIN")).thenReturn(Role.builder().name("ADMIN").build());

        assertThrows(RoleAlreadyExistException.class, () -> service.createRole(dto));
    }

    @Test
    void shouldCreateRoleWithPermissions() {
        RoleRequestDto dto = dto("STOCK_MANAGER", List.of(1L, 2L));
        Permission p1 = Permission.builder().id(1L).name("GET_ALL_ITEMS").permission("Lire stock").build();
        Permission p2 = Permission.builder().id(2L).name("UPDATE_ITEM").permission("Modifier stock").build();
        when(roleRepository.findByName("STOCK_MANAGER")).thenReturn(null);
        when(permissionService.getPermissionById(1L)).thenReturn(p1);
        when(permissionService.getPermissionById(2L)).thenReturn(p2);

        assertEquals("Successfully created", service.createRole(dto));

        ArgumentCaptor<Role> captor = ArgumentCaptor.forClass(Role.class);
        verify(roleRepository).save(captor.capture());
        assertEquals("STOCK_MANAGER", captor.getValue().getName());
        assertEquals(2, captor.getValue().getPermissions().size());
    }

    @Test
    void shouldRejectRoleUpdateWithoutValidPermissions() {
        Role role = Role.builder().id(3L).name("OLD").permissions(new HashSet<>()).build();
        RoleRequestDto dto = dto("NEW", List.of(9L));
        when(roleRepository.findById(3L)).thenReturn(Optional.of(role));
        when(permissionService.getAllPermissionsByIds(dto.getPermission_ids())).thenReturn(List.of());

        assertThrows(IllegalArgumentException.class, () -> service.updateRole(3L, dto));
    }

    @Test
    void shouldReturnRolePermissionLabels() {
        Permission p1 = Permission.builder().permission("Lire stock").build();
        Permission p2 = Permission.builder().permission("Modifier stock").build();
        Role role = Role.builder().id(4L).permissions(new HashSet<>(List.of(p1, p2))).build();
        when(roleRepository.findById(4L)).thenReturn(Optional.of(role));

        List<String> result = service.getRolePermissions(4L);

        assertEquals(2, result.size());
        assertTrue(result.contains("Lire stock"));
        assertTrue(result.contains("Modifier stock"));
    }

    @Test
    void shouldRejectDeletingUnknownRole() {
        when(roleRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(RoleNotExistException.class, () -> service.deleteRole(99L));
    }

    private RoleRequestDto dto(String name, List<Long> permissionIds) {
        RoleRequestDto dto = new RoleRequestDto();
        dto.setName(name);
        dto.setPermission_ids(permissionIds);
        return dto;
    }
}
