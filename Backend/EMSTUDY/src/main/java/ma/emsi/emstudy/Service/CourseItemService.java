package ma.emsi.emstudy.Service;

import lombok.RequiredArgsConstructor;
import ma.emsi.emstudy.Entity.CourseItem;
import ma.emsi.emstudy.Repository.CourseItemRepo;
import ma.emsi.emstudy.Repository.CompletedCourseItemRepo;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public abstract class CourseItemService<T extends CourseItem> {
    protected final CourseItemRepo courseItemRepo;
    protected final CompletedCourseItemRepo completedCourseItemRepo;

    public T addCourseItem(T courseItem) {
        courseItem.setAddDate(LocalDateTime.now());
        return (T) courseItemRepo.save(courseItem);
    }

    public List<T> getAllCourseItems() {
        return (List<T>) courseItemRepo.findAll();
    }

    public T getCourseItemById(Long id) {
        return (T) courseItemRepo.findById(id).orElse(null);
    }

    public List<T> getCourseItemsByCourseId(Long courseId) {
        return (List<T>) courseItemRepo.findByCourse_CourseId(courseId);
    }

    public T updateCourseItem(Long id, T updatedItem) {
        T existingItem = (T) courseItemRepo.findById(id).orElse(null);
        if (existingItem != null) {
            updateFields(existingItem, updatedItem);
            return (T) courseItemRepo.save(existingItem);
        }
        return null;
    }

    protected abstract void updateFields(T existingItem, T updatedItem);

    public void deleteCourseItem(Long id) {
        courseItemRepo.deleteById(id);
    }
}
