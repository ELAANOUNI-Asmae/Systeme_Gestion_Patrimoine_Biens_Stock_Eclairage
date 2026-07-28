package ma.project.sgpbse.runner;

import ma.project.sgpbse.repository.user.PermissionRepository;
import ma.project.sgpbse.entity.user.Permission;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private PermissionRepository permissionRepository;

    @Override
    public void run(String... args) throws Exception {
        // Définir la liste de toutes les permissions nécessaires à ton code
        List<String> permissionsAPrevoir = List.of(
                "CREATE_USER",
                "UPDATE_USER",
                "DELETE_USER",
                "GET_PROFIL",
                "GET_ALL_PROFILS",
                "CREATE_ROLE",
                "UPDATE_ROLE",
                "DELETE_ROLE",
                "GET_ROLE_PERMISSIONS",
                "GET_ALL_ROLES"
        );

        for (String nomPermission : permissionsAPrevoir) {
            // Si la permission n'existe pas encore en BDD, on la crée
            if (permissionRepository.findByName(nomPermission) == null) {
                Permission permission = new Permission();
                permission.setName(nomPermission);
                permission.setPermission("Permission pour l'action " + nomPermission);
                permissionRepository.save(permission);
                System.out.println("Base de données : Permission '" + nomPermission + "' initialisée.");
            }
        }
    }
}