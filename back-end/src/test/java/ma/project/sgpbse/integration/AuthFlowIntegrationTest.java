package ma.project.sgpbse.integration;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AuthFlowIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void logoutShouldBePublicAndDeleteJwtCookie() throws Exception {
        mockMvc.perform(post("/sgpbse/auth/logout"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.SET_COOKIE, containsString("jwt-token=")));
    }

    @Test
    void loginShouldRejectInvalidPayload() throws Exception {
        mockMvc.perform(post("/sgpbse/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void forgotPasswordShouldNotRevealWhetherUnknownEmailExists() throws Exception {
        mockMvc.perform(post("/sgpbse/auth/forgot_password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "integration-test-do-not-exist@sgpbse.invalid"
                                }
                                """))
                .andExpect(status().isOk());
    }
}
