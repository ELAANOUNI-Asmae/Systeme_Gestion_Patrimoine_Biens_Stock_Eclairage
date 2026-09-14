package ma.project.sgpbse.integration;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import javax.sql.DataSource;
import java.sql.Connection;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class DatabaseConnectivityIntegrationTest {

    @Autowired
    private DataSource dataSource;

    @Test
    void shouldConnectToPostgreSql() throws Exception {
        try (Connection connection = dataSource.getConnection()) {
            assertNotNull(connection);
            assertFalse(connection.isClosed());
            assertTrue(connection.isValid(2));
        }
    }

    @Test
    void shouldUsePostgreSqlDatabase() throws Exception {
        try (Connection connection = dataSource.getConnection()) {
            String productName = connection.getMetaData().getDatabaseProductName();
            assertNotNull(productName);
            assertTrue(productName.toLowerCase().contains("postgresql"));
        }
    }
}
