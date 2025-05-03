package ma.emsi.emstudy.Service;

import jakarta.validation.constraints.Null;
import lombok.RequiredArgsConstructor;
import ma.emsi.emstudy.Entity.Course;
import ma.emsi.emstudy.Entity.Enrollment;
import ma.emsi.emstudy.Entity.Student;
import ma.emsi.emstudy.Exception.AlreadyEnrolledException;
import ma.emsi.emstudy.Exception.ResourceNotFoundException;
import ma.emsi.emstudy.Repository.CourseRepo;
import ma.emsi.emstudy.Repository.EnrollmentRepo;
import ma.emsi.emstudy.Repository.UserRepo;
import org.apache.coyote.BadRequestException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EnrollmentService {
    
    private final EnrollmentRepo enrollmentRepo;
    private final UserRepo userRepo;
    private final CourseRepo courseRepo;
    private final UserService userService;
    private final StudentService studentService;

@Transactional
public Enrollment createEnrollment(Long studentId, String joinCode) {
    Course course = courseRepo.findByJoinCode(joinCode)
            .orElseThrow(() -> new ResourceNotFoundException("Invalid join code"));
    enrollmentRepo.findByStudentUserIdAndCourse_CourseId(studentId, course.getCourseId())
            .ifPresent(enrollment -> {
                throw new AlreadyEnrolledException("Already enrolled in this course");
            });
    Student student = studentService.getStudent(studentId);
    Enrollment enrollment = Enrollment.builder()
            .student(student)
            .course(course)
            .enrollmentDate(LocalDate.now())
            .build();
    return enrollmentRepo.save(enrollment);
}
    
    public Enrollment getEnrollmentById(Long id) {
        return enrollmentRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found"));
    }
    
    public List<Enrollment> getAllEnrollments() {
        return enrollmentRepo.findAll();
    }
    
    public List<Enrollment> getEnrollmentsByStudentId(Long studentId) {
        return enrollmentRepo.findByStudentUserId(studentId);
    }
    
    public List<Enrollment> getEnrollmentsByCourseId(Long courseId) {
        return enrollmentRepo.findByCourse_CourseId(courseId);
    }
    
    public Enrollment updateEnrollment(Long id, Enrollment enrollment) {
        Enrollment existingEnrollment = getEnrollmentById(id);
        existingEnrollment.setCompletionDate(enrollment.getCompletionDate());
        existingEnrollment.setStudent(enrollment.getStudent());
        existingEnrollment.setCourse(enrollment.getCourse());
        return enrollmentRepo.save(existingEnrollment);
    }
    
    public void deleteEnrollment(Long id) {
        enrollmentRepo.deleteById(id);
    }
    
    public void completeEnrollment(Long id) {
        Enrollment enrollment = getEnrollmentById(id);
        enrollment.setCompletionDate(LocalDate.now());
        enrollmentRepo.save(enrollment);
    }
}