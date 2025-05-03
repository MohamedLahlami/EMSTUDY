package ma.emsi.emstudy.Repository;

import ma.emsi.emstudy.Entity.CompletedCourseItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CompletedCourseItemRepo extends JpaRepository<CompletedCourseItem, Long> {
    List<CompletedCourseItem> findByStudentUserIdAndCourse_CourseId(Long studentUserId, Long courseCourseId);

}
