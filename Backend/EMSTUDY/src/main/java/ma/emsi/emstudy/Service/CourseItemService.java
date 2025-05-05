package ma.emsi.emstudy.Service;

import lombok.NoArgsConstructor;
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
import java.util.Optional;

@Service
@RequiredArgsConstructor
@SuppressWarnings("unchecked")
public class CourseItemService<T extends CourseItem> {
    protected final CourseItemRepo courseItemRepo;
    protected final CourseRepo courseRepo;

    public T addCourseItem(T courseItem, Long courseId) {
        Course course  = courseRepo.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        courseItem.setCourse(course);
        courseItem.setAddDate(LocalDateTime.now());
        return (T) courseItemRepo.save(courseItem);
    }

    //TODO: ma3ndk madir biha
    public List<T> getAllCourseItems() {
        return (List<T>) courseItemRepo.findAll();
    }

    public T getCourseItemById(Long id) {
        CourseItem courseItem = courseItemRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("CourseItem not found with id: " + id));
        return (T) courseItem;
    }

    public List<T> getCourseItemsByCourseId(Long courseId) {
        return (List<T>) courseItemRepo.findByCourseCourseId(courseId);
    }

    public void deleteCourseItem(Long id) {
        courseItemRepo.deleteById(id);
    }

    public T updateCourseItem(Long courseItemId, T updatedItem) {
        CourseItem existingItem = courseItemRepo.findById(courseItemId)
                .orElseThrow(() -> new ResourceNotFoundException("CourseItem not found with id: " + courseItemId));
        updatedItem.setItemId(existingItem.getItemId());
        updatedItem.setCourse(existingItem.getCourse());
        updatedItem.setAddDate(existingItem.getAddDate());
        return (T) courseItemRepo.save(updatedItem);
    }

}