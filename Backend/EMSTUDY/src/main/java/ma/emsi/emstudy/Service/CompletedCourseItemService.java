package ma.emsi.emstudy.Service;

import lombok.RequiredArgsConstructor;
import ma.emsi.emstudy.Entity.*;
import ma.emsi.emstudy.Exception.ResourceNotFoundException;
import ma.emsi.emstudy.Repository.CompletedCourseItemRepo;
import ma.emsi.emstudy.Repository.CourseItemRepo;
import ma.emsi.emstudy.Repository.UserRepo;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CompletedCourseItemService {

    private final CourseItemRepo courseItemRepo;
    private final CompletedCourseItemRepo completedCourseItemRepo;
    private final UserRepo userRepo;

    public CompletedCourseItem save(CompletedCourseItem completedCourseItem) {
        if (completedCourseItem.getCompletedAt() == null) {
            completedCourseItem.setCompletedAt(LocalDate.now());
        }
        return completedCourseItemRepo.save(completedCourseItem);
    }

    public Optional<CompletedCourseItem> findById(Long id) {
        return completedCourseItemRepo.findById(id);
    }

    public CompletedCourseItem findByStudentAndCourse(Long userId, Long courseId) {
        return completedCourseItemRepo.findByStudentUserIdAndCourse_CourseId(userId, courseId);
    }

    public List<CompletedCourseItem> findAll() {
        return completedCourseItemRepo.findAll();
    }

    public void delete(Long id) {
        completedCourseItemRepo.deleteById(id);
    }

    public boolean exists(Long id) {
        return completedCourseItemRepo.existsById(id);
    }

    public ResponseEntity<CompletedCourseItem> markItemAsCompleted(Long studentId, Long courseItemId) {
        CourseItem courseItem = courseItemRepo.findById(courseItemId).orElseThrow(() -> new ResourceNotFoundException("CourseItem not found with id: " + courseItemId));
        User user = userRepo.findByUserIdAndRoleEquals(studentId, "Student").orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));
        if (!(user instanceof Student student)) throw new ResourceNotFoundException("Student not found with id: " + studentId);
        Course course = courseItem.getCourse();
        CompletedCourseItem completedCourseItem = CompletedCourseItem.builder()
                .student(student)
                .courseItem(courseItem)
                .completedAt(LocalDate.now())
                .course(course)
                .build();
        return new ResponseEntity<>(completedCourseItemRepo.save(completedCourseItem), HttpStatus.CREATED);
    }
}
