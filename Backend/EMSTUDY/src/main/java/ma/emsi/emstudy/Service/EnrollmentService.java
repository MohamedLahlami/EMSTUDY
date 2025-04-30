package ma.emsi.emstudy.Service;

import lombok.RequiredArgsConstructor;
import ma.emsi.emstudy.Entity.Course;
import ma.emsi.emstudy.Entity.Enrollment;
import ma.emsi.emstudy.Entity.Student;
import ma.emsi.emstudy.Entity.User;
import ma.emsi.emstudy.Exception.ResourceNotFoundException;
import ma.emsi.emstudy.Repository.CourseRepo;
import ma.emsi.emstudy.Repository.EnrollmentRepo;
import ma.emsi.emstudy.Repository.UserRepo;
import org.apache.coyote.BadRequestException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class EnrollmentService {
    
    private final EnrollmentRepo enrollmentRepo;
    private final UserRepo userRepo;
    private final CourseRepo courseRepo;

    public Enrollment createEnrollment(Long studentId, String joinCode) throws BadRequestException, ResourceNotFoundException {
        Course course = courseRepo.findByJoinCode(joinCode)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid join code"));
        Optional<Enrollment> existingEnrollment = enrollmentRepo.findByStudentUserIdAndCourse_CourseId(studentId, course.getCourseId());
        if (existingEnrollment.isPresent()){
            throw new BadRequestException("Enrollment already exists");
        }
        User user = userRepo.getUserByUserId(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        if (!(user instanceof Student student)) {
            throw new ResourceNotFoundException("Only students can enroll in courses");
        }
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
