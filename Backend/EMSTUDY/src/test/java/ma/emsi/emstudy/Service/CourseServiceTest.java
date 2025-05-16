package ma.emsi.emstudy.Service;

import jakarta.persistence.EntityNotFoundException;
import ma.emsi.emstudy.Entity.Course;
import ma.emsi.emstudy.Entity.CourseItem;
import ma.emsi.emstudy.Entity.Quiz;
import ma.emsi.emstudy.Entity.Teacher;
import ma.emsi.emstudy.Repository.CourseRepo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.BeanUtils;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CourseServiceTest {

    @Mock
    private CourseRepo courseRepo;

    @InjectMocks
    private CourseService courseService;

    private Course testCourse;
    private Teacher testTeacher;
    private Quiz testQuiz;

    @BeforeEach
    void setUp() {
        testTeacher = new Teacher();
        testTeacher.setUserId(1L);
        testTeacher.setUsername("teacher1");
        testTeacher.setEmail("teacher@example.com");

        testCourse = new Course();
        testCourse.setName("Test Course");
        testCourse.setDescription("Test Description");
        testCourse.setTeacher(testTeacher);
        testCourse.setCourseItems(new ArrayList<>());

        testQuiz = new Quiz();
        testQuiz.setTitle("Test Quiz");
        testQuiz.setDurationInMinutes(30);
        testQuiz.setQuestions(new ArrayList<>());
    }

    @Test
    void testAddCourse() {
        // Arrange
        Course savedCourse = new Course();
        BeanUtils.copyProperties(testCourse, savedCourse);
        savedCourse.setCourseId(1L);
        savedCourse.setCreationDate(LocalDate.now());

        when(courseRepo.save(any(Course.class))).thenReturn(savedCourse);

        // Act
        Course result = courseService.addCourse(testCourse);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getCourseId());
        assertEquals("Test Course", result.getName());
        assertNotNull(result.getCreationDate());
        verify(courseRepo, times(1)).save(any(Course.class));
    }

    @Test
    void testAddCourse_WithItems() {
        // Arrange
        testCourse.getCourseItems().add(testQuiz);

        // Using argument captor to verify the correct behavior
        ArgumentCaptor<Course> courseCaptor = ArgumentCaptor.forClass(Course.class);

        when(courseRepo.save(any(Course.class))).thenAnswer(invocation -> {
            Course savedCourse = invocation.getArgument(0);
            savedCourse.setCourseId(1L);
            savedCourse.setCreationDate(LocalDate.now());
            return savedCourse;
        });

        // Act
        Course result = courseService.addCourse(testCourse);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getCourseId());
        assertEquals(1, result.getCourseItems().size());
        assertEquals("Test Quiz", result.getCourseItems().get(0).getTitle());

        // Verify correct interaction with repository
        verify(courseRepo).save(courseCaptor.capture());
        Course capturedCourse = courseCaptor.getValue();

        // Verify course reference is set in the items
        assertEquals(capturedCourse, capturedCourse.getCourseItems().get(0).getCourse());
    }

    @Test
    void testGetCourseById() {
        // Arrange
        Long courseId = 1L;
        testCourse.setCourseId(courseId);

        when(courseRepo.findById(courseId)).thenReturn(Optional.of(testCourse));

        // Act
        Course result = courseService.getCourseById(courseId);

        // Assert
        assertNotNull(result);
        assertEquals(courseId, result.getCourseId());
        verify(courseRepo, times(1)).findById(courseId);
    }

    @Test
    void testGetCourseById_NotFound() {
        // Arrange
        Long courseId = 1L;
        when(courseRepo.findById(courseId)).thenReturn(Optional.empty());

        // Act
        Course result = courseService.getCourseById(courseId);

        // Assert
        assertNull(result);
        verify(courseRepo, times(1)).findById(courseId);
    }

    @Test
    void testGetAllTeacherCourses() {
        // Arrange
        Long teacherId = 1L;
        List<Course> courses = Arrays.asList(testCourse);

        when(courseRepo.findByTeacherUserId(teacherId)).thenReturn(courses);

        // Act
        List<Course> result = courseService.getAllTeacherCourses(teacherId);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(courseRepo, times(1)).findByTeacherUserId(teacherId);
    }

    @Test
    void testUpdateCourse() {
        // Arrange
        Long courseId = 1L;
        testCourse.setCourseId(courseId);

        Course updatedCourse = new Course();
        updatedCourse.setCourseId(courseId);
        updatedCourse.setName("Updated Name");
        updatedCourse.setDescription("Updated Description");

        when(courseRepo.findById(courseId)).thenReturn(Optional.of(testCourse));
        when(courseRepo.save(any(Course.class))).thenReturn(updatedCourse);

        // Act
        Course result = courseService.updateCourse(updatedCourse);

        // Assert
        assertNotNull(result);
        assertEquals("Updated Name", result.getName());
        assertEquals("Updated Description", result.getDescription());
        verify(courseRepo).findById(courseId);
        verify(courseRepo).save(any(Course.class));
    }

    @Test
    void testUpdateCourse_NotFound() {
        // Arrange
        Long courseId = 1L;
        Course updatedCourse = new Course();
        updatedCourse.setCourseId(courseId);

        when(courseRepo.findById(courseId)).thenReturn(Optional.empty());

        // Act
        Course result = courseService.updateCourse(updatedCourse);

        // Assert
        assertNull(result);
        verify(courseRepo).findById(courseId);
        verify(courseRepo, never()).save(any(Course.class));
    }

    @Test
    void testDeleteCourse() {
        // Arrange
        Long courseId = 1L;
        doNothing().when(courseRepo).deleteById(courseId);

        // Act
        courseService.deleteCourse(courseId);

        // Assert
        verify(courseRepo, times(1)).deleteById(courseId);
    }

    @Test
    void testIsTeacherOfCourse() {
        // Arrange
        Long teacherId = 1L;
        Long courseId = 1L;
        when(courseRepo.existsByTeacherUserIdAndCourseId(teacherId, courseId)).thenReturn(true);

        // Act
        boolean result = courseService.isTeacherOfCourse(teacherId, courseId);

        // Assert
        assertTrue(result);
        verify(courseRepo).existsByTeacherUserIdAndCourseId(teacherId, courseId);
    }
}