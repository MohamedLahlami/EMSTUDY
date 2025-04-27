package ma.emsi.emstudy.Service;

import lombok.RequiredArgsConstructor;
import ma.emsi.emstudy.Entity.Enrollment;
import ma.emsi.emstudy.Repository.EnrollmentRepo;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EnrollmentService {
    
    private final EnrollmentRepo enrollmentRepo;
    
    public Enrollment createEnrollment(Enrollment enrollment) {
        enrollment.setEnrollmentDate(LocalDate.now());
        return enrollmentRepo.save(enrollment);
    }
    
    public Enrollment getEnrollment(Long id) {
        return enrollmentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));
    }
    
    public List<Enrollment> getAllEnrollments() {
        return enrollmentRepo.findAll();
    }
    
    public List<Enrollment> getEnrollmentsByStudent(Long studentId) {
        return enrollmentRepo.findByStudentUserId(studentId);
    }
    
    public List<Enrollment> getEnrollmentsByCourse(Long courseId) {
        return enrollmentRepo.findByCourse_CourseId(courseId);
    }
    
    public Enrollment updateEnrollment(Long id, Enrollment enrollment) {
        Enrollment existingEnrollment = getEnrollment(id);
        existingEnrollment.setCompletionDate(enrollment.getCompletionDate());
        existingEnrollment.setStudent(enrollment.getStudent());
        existingEnrollment.setCourse(enrollment.getCourse());
        return enrollmentRepo.save(existingEnrollment);
    }
    
    public void deleteEnrollment(Long id) {
        enrollmentRepo.deleteById(id);
    }
    
    public void completeEnrollment(Long id) {
        Enrollment enrollment = getEnrollment(id);
        enrollment.setCompletionDate(LocalDate.now());
        enrollmentRepo.save(enrollment);
    }
}
