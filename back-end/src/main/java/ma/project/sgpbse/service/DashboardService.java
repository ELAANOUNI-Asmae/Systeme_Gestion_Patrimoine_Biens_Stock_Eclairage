package ma.project.sgpbse.service;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import ma.project.sgpbse.entity.stock.LowStockAlert;
import ma.project.sgpbse.entity.user.User;
import ma.project.sgpbse.enums.AssetStatus;
import ma.project.sgpbse.enums.StockMovementType;
import ma.project.sgpbse.service.asset.AssetService;
import ma.project.sgpbse.service.publicLighting.FailureService;
import ma.project.sgpbse.service.publicLighting.LightPointService;
import ma.project.sgpbse.service.stock.ItemService;
import ma.project.sgpbse.service.stock.LowStockAlertService;
import ma.project.sgpbse.service.stock.StockMovementService;
import ma.project.sgpbse.service.user.CurrentUserService;
import ma.project.sgpbse.service.user.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@AllArgsConstructor

@Service
public class DashboardService {

    @Autowired
    private final CurrentUserService currentUserService;
    @Autowired
    private final UserService  userService;
    @Autowired
    private final AssetService assetService;
    @Autowired
    private final ItemService itemService;
    @Autowired
    private final LightPointService lightPointService;
    @Autowired
    private final FailureService failureService;
    @Autowired
    private final LowStockAlertService  lowStockAlertService;
    @Autowired
    private final StockMovementService stockMovementService;

    //get connected username fr
    @Transactional
    public String getConnectedUsernameFr(){
        User user = currentUserService.getCurrentUser();
        return user.getFirstname_fr() + " " + user.getLastname_fr();
    }

    //get connected username ar
    @Transactional
    public String getConnectedUsernameAr(){
        User user = currentUserService.getCurrentUser();
        return user.getFirstname_ar() + " " + user.getLastname_ar();
    }

    //get role name user
    @Transactional
    public String getRoleNameOfConnectedUser(){
        User user = currentUserService.getCurrentUser();
        return user.getRole().getName();
    }

    //nmb total d'utilisateur
    @Transactional
    public Long countTotalUsers(){
        return userService.countAllUsers();
    }

    //nmb total des biens
    @Transactional
    public Long countTotalAssets(){
        return assetService.countAllAssets();
    }

    //nmb total d'articles
    @Transactional
    public Long countTotalItems(){
        return itemService.countAllItems();
    }

    //nmb total de points lumineux
    @Transactional
    public Long countTotalLightPoints(){
        return lightPointService.countAllLightPoints();
    }

    //nmb total des biens selon le status
    @Transactional
    public Long countTotalAssetsByStatus(AssetStatus status){
        return assetService.countAllAssetsByStatus(status);
    }

    //nmb total des pannes
    @Transactional
    public Long countTotalFailures(){
        return failureService.countAllFailures();
    }

    //nmb total de mvmt de stock(1semaine)
    @Transactional
    public Long countTotalStockMovementByPeriod(Long day_numbers){
        return stockMovementService.countAllStockMovementByPeriod(day_numbers);
    }


    //nmb des alertes stock(stock faibles)
    @Transactional
    public Long countTotalLowStockAlerts(){
        return lowStockAlertService.countAllLowStockAlerts();
    }


    //les alertes récentes(1semaine)
    @Transactional
    public List<LowStockAlert> getLowStockAlertsByPeriod(Long  day_numbers){
        return lowStockAlertService.getLowStockAlertsByPeriod(day_numbers);
    }
}
