package ma.emsi.emstudy.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserRegisterDTO {
    private String username;
    private String email;
    private String password;
    private String role;
    private String bio;
    private String studentGroup;
}
