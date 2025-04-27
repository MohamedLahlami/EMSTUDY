package ma.emsi.emstudy.Repository;

import ma.emsi.emstudy.Entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EnrollmentRepo extends JpaRepository<Enrollment, Long> {
    List<Enrollment> findByStudentUserId(Long studentId);
    List<Enrollment> findByCourse_CourseId(Long courseId);
}
