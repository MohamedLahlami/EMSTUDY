package ma.emsi.emstudy.Service;

import lombok.RequiredArgsConstructor;
import ma.emsi.emstudy.Entity.Answer;
import ma.emsi.emstudy.Entity.CourseItem;
import ma.emsi.emstudy.Exception.ResourceNotFoundException;
import ma.emsi.emstudy.Repository.CourseItemRepo;
import ma.emsi.emstudy.Repository.CompletedCourseItemRepo;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseItemService<T extends CourseItem> {
    protected final CourseItemRepo courseItemRepo;
    protected final CompletedCourseItemRepo completedCourseItemRepo;

    public T addCourseItem(T courseItem, Long courseId) {
        courseItem.setAddDate(LocalDateTime.now());
        return (T) courseItemRepo.save(courseItem);
    }

    public List<T> getAllCourseItems() {
        return (List<T>) courseItemRepo.findAll();
    }

    public T getCourseItemById(Long id) {
        return (T) courseItemRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CourseItem not found with id: " + id));
    }

    public List<T> getCourseItemsByCourseId(Long courseId) {
        return (List<T>) courseItemRepo.findByCourse_CourseId(courseId);
    }

    public T updateCourseItem(Long id, T updatedItem) {
        T existingItem = getCourseItemById(id);
        updateFields(existingItem, updatedItem);
        return (T) courseItemRepo.save(existingItem);
    }

    protected void updateFields(T existingItem, T updatedItem) {
        existingItem.setTitle(updatedItem.getTitle());
    }

    public void deleteCourseItem(Long id) {
        courseItemRepo.deleteById(id);
    }

}
