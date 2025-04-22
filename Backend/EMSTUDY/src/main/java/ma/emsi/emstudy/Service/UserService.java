package ma.emsi.emstudy.Service;

import lombok.RequiredArgsConstructor;
import ma.emsi.emstudy.Entity.User;
import ma.emsi.emstudy.Repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final BCryptPasswordEncoder passwordEncoder;

    private final UserRepo userRepo;

    public boolean existsByEmail(String email) {
        return userRepo.existsByEmail(email);
    }

    public <T extends User> T createUser(T user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepo.save(user);
    }

    public List<User> findAll() {
        return userRepo.findAll();
    }

    public Optional<User> findByUsername(String username) {
        return userRepo.findByUsername(username);
    }

    public Optional<User> findById(Long id) {
        return userRepo.findById(id);
    }

    public void deleteUser(Long id) {
        userRepo.deleteById(id);
    }
}