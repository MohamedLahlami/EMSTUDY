package ma.emsi.emstudy.Controller;

import ma.emsi.emstudy.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@Deprecated
@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserService userService;


}
