package ma.project.sgpbse.integration;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void stockEndpointShouldRejectAnonymousUser() throws Exception {
        mockMvc.perform(get("/sgpbse/item/all"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    void assetEndpointShouldRejectAnonymousUser() throws Exception {
        mockMvc.perform(get("/sgpbse/asset/all"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    void privateLightingEndpointShouldRejectAnonymousUser() throws Exception {
        mockMvc.perform(get("/sgpbse/lightPoint/all"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    void currentUserEndpointShouldRejectAnonymousUser() throws Exception {
        mockMvc.perform(get("/sgpbse/user/me"))
                .andExpect(status().is4xxClientError());
    }
}
