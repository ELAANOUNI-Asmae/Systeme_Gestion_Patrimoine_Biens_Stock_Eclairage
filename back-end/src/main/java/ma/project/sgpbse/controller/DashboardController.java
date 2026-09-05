package ma.project.sgpbse.controller;

import lombok.AllArgsConstructor;
import ma.project.sgpbse.entity.stock.LowStockAlert;
import ma.project.sgpbse.enums.AssetStatus;
import ma.project.sgpbse.enums.StockMovementType;
import ma.project.sgpbse.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@AllArgsConstructor

@RestController
@RequestMapping("/sgpbse/dashboard")
public class DashboardController {

    @Autowired
    private final DashboardService dashboardService;

    //get connected username ar
    @GetMapping("/username_ar")
    @PreAuthorize("hasAuthority('GET_CONNECTED_USERNAME')")
    public ResponseEntity<String> getConnectedUsernameAr(){
        return  ResponseEntity.ok(dashboardService.getConnectedUsernameAr());
    }

    //get connected username fr
    @GetMapping("/username_fr")
    @PreAuthorize("hasAuthority('GET_CONNECTED_USERNAME')")
    public ResponseEntity<String> getConnectedUsernameFr(){
        return  ResponseEntity.ok(dashboardService.getConnectedUsernameFr());
    }

    //get role name user
    @GetMapping("/role_name")
    @PreAuthorize("hasAuthority('GET_ROLE_NAME')")
    public ResponseEntity<String> getRoleNameOfConnectedUser(){
        return ResponseEntity.ok(dashboardService.getRoleNameOfConnectedUser());
    }

    //nmb total d'utilisateur
    @GetMapping("/count_users")
    @PreAuthorize("hasAuthority('COUNT_USERS')")
    public ResponseEntity<Long> countTotalUsers(){
        return ResponseEntity.ok(dashboardService.countTotalUsers());
    }

    //nmb total des biens
    @GetMapping("/count_assets")
    @PreAuthorize("hasAuthority('COUNT_ASSETS')")
    public ResponseEntity<Long> countTotalAssets(){
        return ResponseEntity.ok(dashboardService.countTotalAssets());
    }

    //nmb total d'articles
    @GetMapping("/count_items")
    @PreAuthorize("hasAuthority('COUNT_ITEMS')")
    public ResponseEntity<Long> countTotalItems(){
        return ResponseEntity.ok(dashboardService.countTotalItems());
    }

    //nmb total de points lumineux
    @GetMapping("/count_light_points")
    @PreAuthorize("hasAuthority('COUNT_LIGHT_POINTS')")
    public ResponseEntity<Long> countTotalLightPoints(){
        return  ResponseEntity.ok(dashboardService.countTotalLightPoints());
    }

    //nmb total des biens selon le status
    @GetMapping("/count_assets_by_status")
    @PreAuthorize("hasAuthority('COUNT_ASSETS_BY_STATUS')")
    public ResponseEntity<Long> countTotalAssetsByStatus(@RequestBody AssetStatus status){
        return ResponseEntity.ok(dashboardService.countTotalAssetsByStatus(status));
    }

    //nmb total des pannes
    @GetMapping("/count_failures")
    @PreAuthorize("hasAuthority('COUNT_FAILURES')")
    public ResponseEntity<Long> countTotalFailures(){
        return ResponseEntity.ok(dashboardService.countTotalFailures());
    }

    //nmb total de mvmt de stock(1semaine)
    @GetMapping("/count_stock_movement_by_period")
    @PreAuthorize("hasAuthority('COUNT_STOCK_MOVEMENT_BY_PERIOD')")
    public ResponseEntity<Long> countTotalStockMovementByPeriod(@RequestBody Long day_numbers){
        return ResponseEntity.ok(dashboardService.countTotalStockMovementByPeriod(day_numbers));
    }

    //nmb des alertes stock(stock faibles)
    @GetMapping("/count_low_stock_alerts")
    @PreAuthorize("hasAuthority('COUNT_LOW_STOCK_ALERTS')")
    public ResponseEntity<Long> countTotalLowStockAlerts(){
        return ResponseEntity.ok(dashboardService.countTotalLowStockAlerts());
    }


    //les alertes récentes(1semaine)
    @GetMapping("/get_low_stock_alerts_by_period")
    @PreAuthorize("hasAuthority('GET_LOW_STOCK_ALERTS_BY_PERIOD')")
    public ResponseEntity<List<LowStockAlert>> getLowStockAlertsByPeriod(@RequestBody Long  day_numbers){
        return ResponseEntity.ok(dashboardService.getLowStockAlertsByPeriod(day_numbers));
    }

}
