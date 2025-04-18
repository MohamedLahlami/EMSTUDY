package ma.emsi.emstudy.Service;

import ma.emsi.emstudy.Entity.User;
import ma.emsi.emstudy.Repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private UserRepo userRepo;

    // Create a new user (Teacher or Student)
    public <T extends User> T createUser(T user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepo.save(user);
    }

    // Retrieve all users
    public List<User> findAll() {
        return userRepo.findAll();
    }

    // Find a user by username
    public Optional<User> findByUsername(String username) {
        return userRepo.findByUsername(username);
    }

    // Find a user by ID
    public Optional<User> findById(Long id) {
        return userRepo.findById(id);
    }

    // Delete a user by ID
    public void deleteUser(Long id) {
        userRepo.deleteById(id);
    }
}