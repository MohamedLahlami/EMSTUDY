package ma.emsi.emstudy.Service;

import lombok.RequiredArgsConstructor;
import ma.emsi.emstudy.Entity.CompletedCourseItem;
import ma.emsi.emstudy.Repository.CompletedCourseItemRepo;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CompletedCourseItemService {

    private final CompletedCourseItemRepo completedCourseItemRepo;

    public CompletedCourseItem save(CompletedCourseItem completedCourseItem) {
        if (completedCourseItem.getCompletedAt() == null) {
            completedCourseItem.setCompletedAt(LocalDate.now());
        }
        return completedCourseItemRepo.save(completedCourseItem);
    }

    public Optional<CompletedCourseItem> findById(Long id) {
        return completedCourseItemRepo.findById(id);
    }

    public CompletedCourseItem findByStudentAndCourse(Long userId, Long courseId) {
        return completedCourseItemRepo.findByStudentUserIdAndCourseId(userId, courseId);
    }

    public List<CompletedCourseItem> findAll() {
        return completedCourseItemRepo.findAll();
    }

    public void delete(Long id) {
        completedCourseItemRepo.deleteById(id);
    }

    public boolean exists(Long id) {
        return completedCourseItemRepo.existsById(id);
    }
}
