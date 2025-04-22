package ma.emsi.emstudy.Repository;

import ma.emsi.emstudy.Entity.CompletedCourseItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CompletedCourseItemRepo extends JpaRepository<CompletedCourseItem, Long> {
    CompletedCourseItem findByStudentUserIdAndCourseId(Long userId, Long courseId);
}
