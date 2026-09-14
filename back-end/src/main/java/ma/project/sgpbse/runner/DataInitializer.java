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
                "ACTIVATE_ACCOUNT",
                "APROUVE_ITEM_REQUEST",
                "CANCEL_ITEM_REQUEST",
                "CANCEL_MAINTENANCE",
                "CANCEL_RENTAL",
                "COMPLETE_INTERVENTION",
                "COMPLETE_MAINTENANCE",
                "CONFIRM_ITEM_REQUEST_DELIVERY",
                "COUNT_ASSET",
                "COUNT_ASSETS",
                "COUNT_ASSETS_BY_STATUS",
                "COUNT_FAILURES",
                "COUNT_IN_STOCK_BY_ITEM",
                "COUNT_IN_STOCK_BY_PERIOD",
                "COUNT_INTERVENTIONS_BY_STATUS",
                "COUNT_ITEMS",
                "COUNT_ITEM_REQUESTS_BY_STATUS",
                "COUNT_LIGHT_POINTS",
                "COUNT_LIGHT_POINTS_BY_STATUS",
                "COUNT_LOW_STOCK_ALERTS",
                "COUNT_NOTIF",
                "COUNT_STOCK_MOVEMENT_BY_PERIOD",
                "COUNT_TOTAL_IN_STOCK",
                "COUNT_TOTAL_QUANTITIES",
                "COUNT_USERS",
                "CREATE_ASSET",
                "CREATE_IN_STOCK",
                "CREATE_ITEM",
                "CREATE_ITEM_REQUEST",
                "CREATE_LIGHT_POINT",
                "CREATE_ROLE",
                "CREATE_USER",
                "DEACTIVATE_ACCOUNT",
                "DELETE_ASSET",
                "DELETE_ITEM",
                "DELETE_LIGHT_POINT",
                "DELETE_MAINTENANCE",
                "DELETE_ROLE",
                "DELETE_USER",
                "DISPOSE_ASSET",
                "FILTER_ITEM_REQUESTS_BY_USER",
                "FILTER_LIGHT_POINTS_BY_STATUS",
                "FILTER_NOTIF_BY_STATUS",
                "FILTER_USERS_BY_ROLE",
                "GET_ACCIDENT",
                "GET_ALL_ACCIDENT",
                "GET_ALL_ASSETS",
                "GET_ALL_DISPOSALS",
                "GET_ALL_FAILURE",
                "GET_ALL_FUEL_TANKS",
                "GET_ALL_ITEMS",
                "GET_ALL_ITEM_REQUESTS",
                "GET_ALL_LIGHT_POINT",
                "GET_ALL_MAINTENANCE",
                "GET_ALL_PROFILS",
                "GET_ALL_RENTALS",
                "GET_ALL_ROLES",
                "GET_ARCHIVED_ASSETS",
                "GET_ASSET",
                "GET_ASSETS_BY_STATUS",
                "GET_ASSETS_BY_TYPE",
                "GET_ASSET_INFOS",
                "GET_CONNECTED_USERNAME",
                "GET_DISPOSAL",
                "GET_FAILURE",
                "GET_FUEL_TANK",
                "GET_INTERVENTION",
                "GET_ITEM",
                "GET_ITEMS_WITH_LOW_STOCK",
                "GET_ITEM_REQUEST",
                "GET_ITEM_STAT",
                "GET_LIGHT_POINT",
                "GET_LOW_STOCK_ALERTS_BY_PERIOD",
                "GET_MAINTENANCE",
                "GET_PROFIL",
                "GET_RENTAL",
                "GET_ROLE_NAME",
                "GET_ROLE_NAMES",
                "GET_ROLE_PERMISSIONS",
                "GET_STOCK_MOVEMENT_PER_ITEM",
                "MARK_ALL_NOTIF_AS_READ",
                "MARK_NOTIF_AS_READ",
                "REFUL_VEHICLE",
                "REGISTER_ACCIDENT",
                "REJECT_ITEM_REQUEST",
                "RENT_ASSET",
                "REPORT_FAILURE",
                "SCHEDULE_INTERVENTION",
                "SCHEDULE_MAINTENANCE",
                "SEARCH_ARCHIVED_ASSETS",
                "SEARCH_ASSET",
                "SEARCH_INTERVENTIONS",
                "SEARCH_ITEM",
                "SEARCH_LIGHT_POINTS",
                "SEARCH_USER",
                "START_INTERVENTION",
                "START_MAINTENANCE",
                "UPDATE_ASSET",
                "UPDATE_ITEM",
                "UPDATE_ITEM_QUANTITY",
                "UPDATE_LIGHT_POINT",
                "UPDATE_LIGHT_POINT_STATUS",
                "UPDATE_MAINTENANCE",
                "UPDATE_MAINTENANCE_STATUS",
                "UPDATE_RENTAL",
                "UPDATE_ROLE",
                "UPDATE_USER",
                "GET_ACCIDENT_NOTIFICATION",
                "GET_DISPOSAL_NOTIFICATION",
                "GET_FUEL_TANK_NOTIFICATION",
                "GET_MAINTENANCE_NOTIFICATION",
                "GET_RENTAL_NOTIFICATION",
                "GET_FAILURE_NOTIFICATION",
                "GET_INTERVENTION_NOTIFICATION",
                "GET_ALERT_STOCK_MVMT_OFF_DOCS",
                "GET_ITEM_REQUEST_NOTIFICATION",
                "READ_STOCK_ALERTS"

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