package ma.emsi.emstudy.Security;

import lombok.RequiredArgsConstructor;
import ma.emsi.emstudy.Entity.User;
import ma.emsi.emstudy.Repository.UserRepo;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

@RequiredArgsConstructor
public class AppUserDetailsService implements UserDetailsService {

    private final UserRepo userRepo;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with the Email: " + email));
        return new AppUserDetails(user);
    }
}
