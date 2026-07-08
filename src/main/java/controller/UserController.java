package controller;

import entity.User;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping

public class UserController {
    private final UserSrvice  userservice;

    public UserController(UserService usersService){
        this.userservice = usersService;

    }

}
