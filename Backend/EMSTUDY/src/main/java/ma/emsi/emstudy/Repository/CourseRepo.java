package ma.emsi.emstudy.Repository;

import ma.emsi.emstudy.Entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepo extends JpaRepository<Course, Long> {
    Optional<Course> findByJoinCode(String joinCode);
    Boolean existsByTeacherUserIdAndCourseId(Long teacherId, Long courseId);
    List<Course> findByTeacherUserId(Long teacherId);
}