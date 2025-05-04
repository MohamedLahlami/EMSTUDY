package ma.emsi.emstudy.Service;

import lombok.RequiredArgsConstructor;
import ma.emsi.emstudy.Entity.*;
import ma.emsi.emstudy.Exception.ResourceNotFoundException;
import ma.emsi.emstudy.Repository.CourseItemRepo;
import ma.emsi.emstudy.Repository.CompletedCourseItemRepo;
import ma.emsi.emstudy.Repository.CourseRepo;
import ma.emsi.emstudy.Repository.UserRepo;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@SuppressWarnings("unchecked")
public abstract class CourseItemService<T extends CourseItem> {
    protected final CourseItemRepo courseItemRepo;
    private final CourseRepo courseRepo;

    public T addCourseItem(T courseItem, Long courseId) {
        Course course  = courseRepo.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        courseItem.setCourse(course);
        courseItem.setAddDate(LocalDateTime.now());
        return (T) courseItemRepo.save(courseItem);
    }

    public List<T> getAllCourseItems() {
        return (List<T>) courseItemRepo.findAll();
    }

    public T getCourseItemById(Long id) {
        CourseItem courseItem = courseItemRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("CourseItem not found with id: " + id));
        return (T) courseItem;
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