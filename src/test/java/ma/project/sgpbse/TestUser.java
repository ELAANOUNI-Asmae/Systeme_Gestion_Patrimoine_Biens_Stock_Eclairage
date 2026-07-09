package ma.project.sgpbse;

import ma.project.sgpbse.dto.request.UserCreationDtoRequest;
import ma.project.sgpbse.dto.response.UserDtoResponse;
import ma.project.sgpbse.repository.UserRepository;
import ma.project.sgpbse.service.user.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.mockito.Mockito.mock;

@SpringBootTest
public class TestUser {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private  UserService userService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testUserCreation(){

        //Arrange
        //***User with valid informations
        UserCreationDtoRequest user1dto = new UserCreationDtoRequest("asmae@example.com",
                "Asmae",
                "ELAANOUNI",
                "FEMALE",
                "+212",
                "J1234",
                "User2026@@",
                "ADMIN");
        //***user with invalid email
        UserCreationDtoRequest user2dto = new UserCreationDtoRequest("asmaec",
                "Asmae",
                "ELAANOUNI",
                "FEMALE",
                "+212",
                "J1234",
                "User2026@@",
                "AGENT");
        //***user with invalid pwd
        UserCreationDtoRequest user3dto = new UserCreationDtoRequest("asmae@example.com",
                "Asmae",
                "ELAANOUNI",
                "FEMALE",
                "+212",
                "J1234",
                "U",
                "ADMIN");

        //Act
        ResponseEntity<UserDtoResponse> response1 = userService.createUser(user1dto);
        ResponseEntity<UserDtoResponse> response2 = userService.createUser(user2dto);
        ResponseEntity<UserDtoResponse> response3 = userService.createUser(user3dto);

        //Assert
        assertThat(response1.getStatusCode()).isEqualTo(200);
        assertThat(response2.getStatusCode()).isNotEqualTo(200);
        assertThat(response3.getStatusCode()).isNotEqualTo(200);

    }
}
