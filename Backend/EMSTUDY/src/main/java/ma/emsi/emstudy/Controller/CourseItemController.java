package ma.emsi.emstudy.Controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.emsi.emstudy.Entity.CourseItem;
import ma.emsi.emstudy.Service.CourseItemService;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequiredArgsConstructor
@Validated
public class CourseItemController<T extends CourseItem> {
    protected final CourseItemService<T> service;

    @PostMapping("/courses/{courseId}/items")
    public ResponseEntity<T> createCourseItem(
            @PathVariable Long courseId,
            @Valid @RequestBody T courseItem) {
        T createdItem = service.addCourseItem(courseItem, courseId);
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(createdItem.getItemId())
                .toUri();
        return ResponseEntity.created(location).body(createdItem);
    }

    @GetMapping("/courses/{courseId}/items")
    public ResponseEntity<List<T>> getItemsByCourse(@PathVariable Long courseId) {
        List<T> items = service.getCourseItemsByCourseId(courseId);
        return ResponseEntity.ok(items);
    }

    @GetMapping("/course-items/{itemId}")
    public ResponseEntity<T> getItemById(@PathVariable Long itemId) {
        T item = service.getCourseItemById(itemId);
        return item != null
                ? ResponseEntity.ok(item)
                : ResponseEntity.notFound().build();
    }

    @PutMapping("/course-items/{itemId}")
    public ResponseEntity<T> updateItem(
            @PathVariable Long itemId,
            @Valid @RequestBody T courseItem) {
        T updatedItem = service.updateCourseItem(itemId, courseItem);
        return updatedItem != null 
                ? ResponseEntity.ok(updatedItem)
                : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/course-items/{itemId}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long itemId) {
        service.deleteCourseItem(itemId);
        return ResponseEntity.noContent().build();
    }
}
