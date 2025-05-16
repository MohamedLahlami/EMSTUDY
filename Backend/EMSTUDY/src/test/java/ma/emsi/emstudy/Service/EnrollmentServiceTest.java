package ma.emsi.emstudy.Service;

import ma.emsi.emstudy.Entity.Course;
import ma.emsi.emstudy.Entity.Enrollment;
import ma.emsi.emstudy.Entity.Student;
import ma.emsi.emstudy.Entity.Teacher;
import ma.emsi.emstudy.Exception.AlreadyEnrolledException;
import ma.emsi.emstudy.Exception.ResourceNotFoundException;
import ma.emsi.emstudy.Repository.CourseRepo;
import ma.emsi.emstudy.Repository.EnrollmentRepo;
import ma.emsi.emstudy.Repository.UserRepo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EnrollmentServiceTest {

    @Mock
    private EnrollmentRepo enrollmentRepo;

    @Mock
    private CourseRepo courseRepo;

    @Mock
    private UserRepo userRepo;

    @Mock
    private UserService userService;

    @Mock
    private StudentService studentService;

    @InjectMocks
    private EnrollmentService enrollmentService;

    private Student testStudent;
    private Course testCourse;
    private Enrollment testEnrollment;
    private String joinCode;

    @BeforeEach
    void setUp() {
        // Create test student
        testStudent = new Student();
        testStudent.setUserId(1L);
        testStudent.setUsername("student1");
        testStudent.setEmail("student@example.com");

        // Create test teacher
        Teacher testTeacher = new Teacher();
        testTeacher.setUserId(2L);
        testTeacher.setUsername("teacher1");

        // Create test course
        testCourse = new Course();
        testCourse.setCourseId(1L);
        testCourse.setName("Test Course");
        testCourse.setDescription("Test Description");
        testCourse.setTeacher(testTeacher);
        joinCode = "ABC12345";
        testCourse.setJoinCode(joinCode);

        // Create test enrollment
        testEnrollment = new Enrollment();
        testEnrollment.setEnrollmentId(1L);
        testEnrollment.setStudent(testStudent);
        testEnrollment.setCourse(testCourse);
        testEnrollment.setEnrollmentDate(LocalDate.now());
    }

    @Test
    void testCreateEnrollment() {
        // Arrange
        Long studentId = 1L;
        when(courseRepo.findByJoinCode(joinCode)).thenReturn(Optional.of(testCourse));
        when(enrollmentRepo.findByStudentUserIdAndCourse_CourseId(studentId, testCourse.getCourseId()))
                .thenReturn(Optional.empty());
        when(studentService.getStudent(studentId)).thenReturn(testStudent);
        when(enrollmentRepo.save(any(Enrollment.class))).thenReturn(testEnrollment);

        // Act
        Enrollment result = enrollmentService.createEnrollment(studentId, joinCode);

        // Assert
        assertNotNull(result);
        assertEquals(testStudent, result.getStudent());
        assertEquals(testCourse, result.getCourse());
        verify(courseRepo).findByJoinCode(joinCode);
        verify(enrollmentRepo).findByStudentUserIdAndCourse_CourseId(studentId, testCourse.getCourseId());
        verify(studentService).getStudent(studentId);
        verify(enrollmentRepo).save(any(Enrollment.class));
    }

    @Test
    void testCreateEnrollment_InvalidJoinCode() {
        // Arrange
        Long studentId = 1L;
        String invalidCode = "INVALID";
        when(courseRepo.findByJoinCode(invalidCode)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            enrollmentService.createEnrollment(studentId, invalidCode);
        });
        verify(courseRepo).findByJoinCode(invalidCode);
    }

    @Test
    void testCreateEnrollment_AlreadyEnrolled() {
        // Arrange
        Long studentId = 1L;
        when(courseRepo.findByJoinCode(joinCode)).thenReturn(Optional.of(testCourse));
        when(enrollmentRepo.findByStudentUserIdAndCourse_CourseId(studentId, testCourse.getCourseId()))
                .thenReturn(Optional.of(testEnrollment));

        // Act & Assert
        assertThrows(AlreadyEnrolledException.class, () -> {
            enrollmentService.createEnrollment(studentId, joinCode);
        });
        verify(courseRepo).findByJoinCode(joinCode);
        verify(enrollmentRepo).findByStudentUserIdAndCourse_CourseId(studentId, testCourse.getCourseId());
    }

    @Test
    void testGetEnrollmentById() {
        // Arrange
        Long enrollmentId = 1L;
        when(enrollmentRepo.findById(enrollmentId)).thenReturn(Optional.of(testEnrollment));

        // Act
        Enrollment result = enrollmentService.getEnrollmentById(enrollmentId);

        // Assert
        assertNotNull(result);
        assertEquals(enrollmentId, result.getEnrollmentId());
        verify(enrollmentRepo).findById(enrollmentId);
    }

    @Test
    void testGetEnrollmentById_NotFound() {
        // Arrange
        Long enrollmentId = 1L;
        when(enrollmentRepo.findById(enrollmentId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            enrollmentService.getEnrollmentById(enrollmentId);
        });
        verify(enrollmentRepo).findById(enrollmentId);
    }

    @Test
    void testGetAllEnrollments() {
        // Arrange
        List<Enrollment> enrollments = Arrays.asList(testEnrollment);
        when(enrollmentRepo.findAll()).thenReturn(enrollments);

        // Act
        List<Enrollment> result = enrollmentService.getAllEnrollments();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(enrollmentRepo).findAll();
    }

    @Test
    void testGetEnrollmentsByStudentId() {
        // Arrange
        Long studentId = 1L;
        List<Enrollment> enrollments = Arrays.asList(testEnrollment);
        when(enrollmentRepo.findByStudentUserId(studentId)).thenReturn(enrollments);

        // Act
        List<Enrollment> result = enrollmentService.getEnrollmentsByStudentId(studentId);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testEnrollment.getEnrollmentId(), result.get(0).getEnrollmentId());
        verify(enrollmentRepo).findByStudentUserId(studentId);
    }

    @Test
    void testGetEnrollmentsByCourseId() {
        // Arrange
        Long courseId = 1L;
        List<Enrollment> enrollments = Arrays.asList(testEnrollment);
        when(enrollmentRepo.findByCourse_CourseId(courseId)).thenReturn(enrollments);

        // Act
        List<Enrollment> result = enrollmentService.getEnrollmentsByCourseId(courseId);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testEnrollment.getEnrollmentId(), result.get(0).getEnrollmentId());
        verify(enrollmentRepo).findByCourse_CourseId(courseId);
    }

    @Test
    void testUpdateEnrollment() {
        // Arrange
        Long enrollmentId = 1L;
        Enrollment updatedEnrollment = new Enrollment();
        updatedEnrollment.setCompletionDate(LocalDate.now());
        updatedEnrollment.setStudent(testStudent);
        updatedEnrollment.setCourse(testCourse);

        when(enrollmentRepo.findById(enrollmentId)).thenReturn(Optional.of(testEnrollment));
        when(enrollmentRepo.save(any(Enrollment.class))).thenReturn(updatedEnrollment);

        // Act
        Enrollment result = enrollmentService.updateEnrollment(enrollmentId, updatedEnrollment);

        // Assert
        assertNotNull(result);
        assertNotNull(result.getCompletionDate());
        verify(enrollmentRepo).findById(enrollmentId);
        verify(enrollmentRepo).save(any(Enrollment.class));
    }

    @Test
    void testCompleteEnrollment() {
        // Arrange
        Long enrollmentId = 1L;
        when(enrollmentRepo.findById(enrollmentId)).thenReturn(Optional.of(testEnrollment));

        // Act
        enrollmentService.completeEnrollment(enrollmentId);

        // Assert
        ArgumentCaptor<Enrollment> enrollmentCaptor = ArgumentCaptor.forClass(Enrollment.class);
        verify(enrollmentRepo).findById(enrollmentId);
        verify(enrollmentRepo).save(enrollmentCaptor.capture());

        Enrollment captured = enrollmentCaptor.getValue();
        assertNotNull(captured.getCompletionDate());
    }

    @Test
    void testDeleteEnrollment() {
        // Arrange
        Long enrollmentId = 1L;
        doNothing().when(enrollmentRepo).deleteById(enrollmentId);

        // Act
        enrollmentService.deleteEnrollment(enrollmentId);

        // Assert
        verify(enrollmentRepo).deleteById(enrollmentId);
    }
}