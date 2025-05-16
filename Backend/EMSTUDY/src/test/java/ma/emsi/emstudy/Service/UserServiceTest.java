package ma.emsi.emstudy.Service;

import ma.emsi.emstudy.Entity.Student;
import ma.emsi.emstudy.Entity.Teacher;
import ma.emsi.emstudy.Entity.User;
import ma.emsi.emstudy.Repository.UserRepo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepo userRepo;

    @Mock
    private BCryptPasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private Student testStudent;
    private Teacher testTeacher;

    @BeforeEach
    void setUp() {
        testStudent = new Student();
        testStudent.setUsername("student1");
        testStudent.setEmail("student@example.com");
        testStudent.setPassword("password");
        testStudent.setStudentGroup("Group A");

        testTeacher = new Teacher();
        testTeacher.setUsername("teacher1");
        testTeacher.setEmail("teacher@example.com");
        testTeacher.setPassword("password");
        testTeacher.setBio("Experienced teacher");
    }

    @Test
    void testCreateUser() {
        // Arrange
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepo.save(any(Student.class))).thenAnswer(invocation -> {
            Student savedStudent = invocation.getArgument(0);
            savedStudent.setUserId(1L);
            return savedStudent;
        });

        // Act
        Student result = userService.createUser(testStudent);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getUserId());
        assertEquals("encodedPassword", result.getPassword());
        verify(passwordEncoder).encode("password");
        verify(userRepo).save(any(Student.class));
    }

    @Test
    void testFindByUsername() {
        // Arrange
        String username = "student1";
        when(userRepo.findByUsername(username)).thenReturn(Optional.of(testStudent));

        // Act
        Optional<User> result = userService.findByUsername(username);

        // Assert
        assertTrue(result.isPresent());
        assertEquals(username, result.get().getUsername());
        verify(userRepo).findByUsername(username);
    }

    @Test
    void testFindById() {
        // Arrange
        Long userId = 1L;
        testStudent.setUserId(userId);
        when(userRepo.findById(userId)).thenReturn(Optional.of(testStudent));

        // Act
        Optional<User> result = userService.findById(userId);

        // Assert
        assertTrue(result.isPresent());
        assertEquals(userId, result.get().getUserId());
        verify(userRepo).findById(userId);
    }

    @Test
    void testFindAll() {
        // Arrange
        List<User> users = Arrays.asList(testStudent, testTeacher);
        when(userRepo.findAll()).thenReturn(users);

        // Act
        List<User> result = userService.findAll();

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        verify(userRepo).findAll();
    }

    @Test
    void testExistsByEmail() {
        // Arrange
        String email = "student@example.com";
        when(userRepo.existsByEmail(email)).thenReturn(true);

        // Act
        boolean result = userService.existsByEmail(email);

        // Assert
        assertTrue(result);
        verify(userRepo).existsByEmail(email);
    }

    @Test
    void testDeleteUser() {
        // Arrange
        Long userId = 1L;
        doNothing().when(userRepo).deleteById(userId);

        // Act
        userService.deleteUser(userId);

        // Assert
        verify(userRepo).deleteById(userId);
    }
}