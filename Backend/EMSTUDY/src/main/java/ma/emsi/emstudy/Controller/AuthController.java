package ma.emsi.emstudy.Controller;


import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import ma.emsi.emstudy.Entity.Student;
import ma.emsi.emstudy.Entity.Teacher;
import ma.emsi.emstudy.Security.AuthenticationService;
import ma.emsi.emstudy.Service.UserService;
import ma.emsi.emstudy.DTO.AuthResponse;
import ma.emsi.emstudy.DTO.LoginRequest;
import ma.emsi.emstudy.DTO.UserDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthController {

    private final UserService userService;
    private final AuthenticationService authenticationService;


    @Operation(
            summary = "Logs the user in",
            description = "Returns a JWT token if the login is successful"
    )
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest loginRequest) {
        UserDetails userdetails = authenticationService.authenticate(
                loginRequest.getEmail(),
                loginRequest.getPassword()
        );
        String tokenValue = authenticationService.generateToken(userdetails);
        AuthResponse authResponse =  AuthResponse.builder()
                .token(tokenValue)
                .expiresIn(86400L)
                .role(userdetails.getAuthorities().iterator().next().getAuthority())
                .build();
        return ResponseEntity.ok(authResponse);
    }

    @Operation(
            summary = "Registers a new user",
            description = "Creates a new user and returns the created user object, `role` field should be `Student` or `Teacher`"
    )
    @PostMapping("/register")
    public ResponseEntity<?> addTeacher(@RequestBody UserDTO userDto) {
        if (userService.existsByEmail(userDto.getEmail())) {
            return new ResponseEntity<>("User with this email already exists", HttpStatus.CONFLICT);
        }
        switch (userDto.getRole()){
            case "Student":
                Student student = new Student();
                student.setEmail(userDto.getEmail());
                student.setPassword(userDto.getPassword());
                student.setUsername(userDto.getUsername());
                student.setRole("Student");
                student.setStudentGroup(userDto.getStudentGroup());
                return new ResponseEntity<>(userService.createUser(student), HttpStatus.CREATED);
            case "Teacher":
                Teacher teacher = new Teacher();
                teacher.setEmail(userDto.getEmail());
                teacher.setPassword(userDto.getPassword());
                teacher.setUsername(userDto.getUsername());
                teacher.setRole("Teacher");
                teacher.setBio(userDto.getBio());
                return new ResponseEntity<>(userService.createUser(teacher), HttpStatus.CREATED);
            default:
                return new ResponseEntity<>("Invalid role", HttpStatus.BAD_REQUEST);
        }
    }

}
