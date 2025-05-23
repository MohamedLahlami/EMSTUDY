package ma.emsi.emstudy.Service;

import lombok.RequiredArgsConstructor;
import ma.emsi.emstudy.Entity.*;
import ma.emsi.emstudy.Exception.ForbiddenAccessException;
import ma.emsi.emstudy.Exception.ResourceNotFoundException;
import ma.emsi.emstudy.Repository.CompletedCourseItemRepo;
import ma.emsi.emstudy.Repository.CourseItemRepo;
import ma.emsi.emstudy.Repository.UserRepo;
import org.apache.coyote.BadRequestException;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CompletedCourseItemService {

    private final CourseItemRepo courseItemRepo;
    private final CompletedCourseItemRepo completedCourseItemRepo;
    private final UserRepo userRepo;
    private final StudentService studentService;

    public List<CompletedCourseItem> getCompletedItemsByCourseAndStudent(Long studentId, Long courseId) {
        if (!studentService.isEnrolledInCourse(studentId, courseId)) {
            throw new ForbiddenAccessException("Student is not enrolled in the course");
        }
        return completedCourseItemRepo.findByStudentUserIdAndCourse_CourseId(studentId, courseId);
    }

    public CompletedCourseItem save(CompletedCourseItem completedCourseItem) {
        if (completedCourseItem.getCompletedAt() == null) {
            completedCourseItem.setCompletedAt(LocalDateTime.now());
        }
        return completedCourseItemRepo.save(completedCourseItem);
    }

    public Optional<CompletedCourseItem> findById(Long id) {
        return completedCourseItemRepo.findById(id);
    }

    public void delete(Long id) {
        completedCourseItemRepo.deleteById(id);
    }

    public CompletedCourseItem markItemAsCompleted(Long studentId, Long courseItemId) {
        CourseItem courseItem = courseItemRepo.findById(courseItemId).orElseThrow(() -> new ResourceNotFoundException("CourseItem not found with id: " + courseItemId));
        User user = userRepo.findByUserIdAndRoleEquals(studentId, "Student").orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));
        if (!(user instanceof Student student)) throw new ResourceNotFoundException("Student not found with id: " + studentId);
        Course course = courseItem.getCourse();
        if (!studentService.isEnrolledInCourse(studentId, course.getCourseId())) throw new ForbiddenAccessException("Student is not enrolled in the course");
        CompletedCourseItem completedCourseItem = CompletedCourseItem.builder()
                .student(student)
                .courseItem(courseItem)
                .completedAt(LocalDateTime.now())
                .course(course)
                .build();
        return completedCourseItemRepo.save(completedCourseItem);
    }
}
