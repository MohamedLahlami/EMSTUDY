package ma.emsi.emstudy.Controller;


import lombok.RequiredArgsConstructor;
import ma.emsi.emstudy.Entity.User;
import ma.emsi.emstudy.Repository.UserRepo;
import ma.emsi.emstudy.Security.AppUserDetails;
import ma.emsi.emstudy.Service.AuthenticationService;
import ma.emsi.emstudy.dto.AuthResponse;
import ma.emsi.emstudy.dto.LoginRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationService authenticationService;
    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody LoginRequest loginRequest) {
        UserDetails user = authenticationService.authenticate(loginRequest.getEmail(), loginRequest.getPassword());
        String tokenValue = authenticationService.generateToken(user);
        AuthResponse authResponse = AuthResponse.builder()
                .token(tokenValue)
                .expiresIn(86400)
                .build();

        return ResponseEntity.ok(authResponse);

    }



}
