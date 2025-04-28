package ma.emsi.emstudy.Service;

import lombok.RequiredArgsConstructor;
import ma.emsi.emstudy.Entity.Course;
import ma.emsi.emstudy.Entity.Enrollment;
import ma.emsi.emstudy.Entity.Student;
import ma.emsi.emstudy.Exception.ResourceNotFoundException;
import ma.emsi.emstudy.Repository.CourseRepo;
import ma.emsi.emstudy.Repository.EnrollmentRepo;
import ma.emsi.emstudy.Repository.UserRepo;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EnrollmentService {
    
    private final EnrollmentRepo enrollmentRepo;
    private final UserRepo userRepo;
    private final CourseRepo courseRepo;

    public Enrollment createEnrollment(Long studentId, Long courseId, String joinCode) {
        Course course = courseRepo.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        if (!course.getJoinCode().equals(joinCode)) {
            throw new ResourceNotFoundException("Invalid join code");
        }
        Student student = userRepo.getUserByUserId(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        Enrollment enrollment = Enrollment.builder()
                .student(student)
                .course(course)
                .build();
        enrollment.setEnrollmentDate(LocalDate.now());
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
    
    public List<Enrollment> getEnrollmentsByCourse(Long courseId) {
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
