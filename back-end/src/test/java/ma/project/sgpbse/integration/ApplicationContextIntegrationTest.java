package ma.project.sgpbse.integration;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class ApplicationContextIntegrationTest {

    @Test
    void applicationContextLoadsWithDatabaseConfiguration() {
        // Le succès du chargement du contexte prouve que les beans Spring,
        // JPA/Hibernate et la configuration de l'application sont cohérents.
    }
}
