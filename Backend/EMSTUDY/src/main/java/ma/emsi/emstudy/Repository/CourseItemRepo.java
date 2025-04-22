package ma.emsi.emstudy.Repository;

import ma.emsi.emstudy.Entity.CourseItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseItemRepo extends JpaRepository<CourseItem, Long> {
     List<CourseItem> findByCourseId(Long courseId);
     List<CourseItem> findByItemType(String itemType);
}
