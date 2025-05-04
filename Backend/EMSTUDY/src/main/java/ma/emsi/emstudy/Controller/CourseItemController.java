package ma.emsi.emstudy.Controller;

import lombok.RequiredArgsConstructor;
import ma.emsi.emstudy.Entity.CourseItem;
import ma.emsi.emstudy.Service.CourseItemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@RequiredArgsConstructor
public class CourseItemController<T extends CourseItem> {

    protected final CourseItemService<T> service;

    protected ResponseEntity<T> createItem(Long courseId, T item) {
        return ResponseEntity.ok(service.addCourseItem(item, courseId));
    }

    @GetMapping("/courses/{courseId}")
    protected ResponseEntity<List<T>> getItemsByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(service.getCourseItemsByCourseId(courseId));
    }

    protected ResponseEntity<T> getItem(Long itemId) {
        T item = service.getCourseItemById(itemId);
        return item != null ? ResponseEntity.ok(item) : ResponseEntity.notFound().build();
    }

    protected ResponseEntity<T> updateItem(Long itemId, T item) {
        T updated = service.updateCourseItem(itemId, item);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    protected ResponseEntity<Void> deleteItem(Long itemId) {
        service.deleteCourseItem(itemId);
        return ResponseEntity.noContent().build();
    }
}