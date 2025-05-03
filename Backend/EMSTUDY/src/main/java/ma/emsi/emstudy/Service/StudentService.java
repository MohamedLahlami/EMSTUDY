package ma.emsi.emstudy.Service;

import lombok.RequiredArgsConstructor;
import ma.emsi.emstudy.Entity.Enrollment;
import ma.emsi.emstudy.Entity.Student;
import ma.emsi.emstudy.Exception.ResourceNotFoundException;
import ma.emsi.emstudy.Repository.EnrollmentRepo;
import ma.emsi.emstudy.Repository.UserRepo;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final UserRepo userRepo;
    private final EnrollmentRepo enrollmentRepo;

    public Student getStudent(Long studentId) {
        return (Student)userRepo.findByUserIdAndRoleEquals(studentId, "Student")
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));
    }

    public Boolean isEnrolledInCourse(Long studentId, Long courseId) {
        Optional<Enrollment> enrollment = enrollmentRepo.findByStudentUserIdAndCourse_CourseId(studentId, courseId);
        return enrollment.isPresent() && enrollment.get().getCompletionDate() == null;
    }
}
