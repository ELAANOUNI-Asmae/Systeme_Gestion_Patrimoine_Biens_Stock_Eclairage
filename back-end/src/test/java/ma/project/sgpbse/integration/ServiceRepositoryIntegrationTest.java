package ma.project.sgpbse.integration;

import ma.project.sgpbse.service.asset.AssetService;
import ma.project.sgpbse.service.publicLighting.FailureService;
import ma.project.sgpbse.service.publicLighting.LightPointService;
import ma.project.sgpbse.service.stock.ItemService;
import ma.project.sgpbse.service.user.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class ServiceRepositoryIntegrationTest {

    @Autowired
    private AssetService assetService;

    @Autowired
    private ItemService itemService;

    @Autowired
    private LightPointService lightPointService;

    @Autowired
    private FailureService failureService;

    @Autowired
    private UserService userService;

    @Test
    void assetServiceShouldReadFromRepositoryAndDatabase() {
        Long count = assetService.countAllAssets();
        assertNotNull(count);
        assertTrue(count >= 0);
    }

    @Test
    void itemServiceShouldReadFromRepositoryAndDatabase() {
        Long count = itemService.countAllItems();
        assertNotNull(count);
        assertTrue(count >= 0);
    }

    @Test
    void lightPointServiceShouldReadFromRepositoryAndDatabase() {
        Long count = lightPointService.countAllLightPoints();
        assertNotNull(count);
        assertTrue(count >= 0);
    }

    @Test
    void failureServiceShouldReadFromRepositoryAndDatabase() {
        Long count = failureService.countAllFailures();
        assertNotNull(count);
        assertTrue(count >= 0);
    }

    @Test
    void userServiceShouldReadFromRepositoryAndDatabase() {
        Long count = userService.countAllUsers();
        assertNotNull(count);
        assertTrue(count >= 0);
    }
}
