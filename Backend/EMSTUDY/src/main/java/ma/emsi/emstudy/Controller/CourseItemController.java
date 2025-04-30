package ma.emsi.emstudy.Controller;

import lombok.RequiredArgsConstructor;
import ma.emsi.emstudy.Entity.CourseItem;
import ma.emsi.emstudy.Service.CourseItemService;
import org.springframework.http.ResponseEntity;

import java.util.List;

@RequiredArgsConstructor
public abstract class CourseItemController<T extends CourseItem> {

    protected final CourseItemService<T> service;

    protected ResponseEntity<T> createItem(Long courseId, T item) {
        return ResponseEntity.ok(service.addCourseItem(item, courseId));
    }

    protected ResponseEntity<List<T>> getItemsByCourse(Long courseId) {
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




//package ma.emsi.emstudy.Controller;
//
//import jakarta.validation.Valid;
//import lombok.RequiredArgsConstructor;
//import ma.emsi.emstudy.Entity.CourseItem;
//import ma.emsi.emstudy.Service.CourseItemService;
//import org.springframework.http.ResponseEntity;
//import org.springframework.validation.annotation.Validated;
//import org.springframework.web.bind.annotation.*;
//import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
//
//import java.net.URI;
//import java.util.List;
//
//@RestController
//@RequiredArgsConstructor
//@Validated
//public abstract class CourseItemController<T extends CourseItem> {
//    protected final CourseItemService<T> service;
//
//
//    public ResponseEntity<T> createCourseItem(
//            @PathVariable Long courseId,
//            @Valid @RequestBody T courseItem) {
//        T createdItem = service.addCourseItem(courseItem, courseId);
//        URI location = ServletUriComponentsBuilder
//                .fromCurrentRequest()
//                .path("/{id}")
//                .buildAndExpand(createdItem.getItemId())
//                .toUri();
//        return ResponseEntity.created(location).body(createdItem);
//    }
//
//    @GetMapping("/courses/{courseId}/items")
//    public ResponseEntity<List<T>> getItemsByCourse(@PathVariable Long courseId) {
//        List<T> items = service.getCourseItemsByCourseId(courseId);
//        return ResponseEntity.ok(items);
//    }
//
//    public ResponseEntity<T> getItemById(@PathVariable Long itemId) {
//        T item = service.getCourseItemById(itemId);
//        return item != null
//                ? ResponseEntity.ok(item)
//                : ResponseEntity.notFound().build();
//    }
//
//    public ResponseEntity<T> updateItem(
//            @PathVariable Long itemId,
//            @Valid @RequestBody T courseItem) {
//        T updatedItem = service.updateCourseItem(itemId, courseItem);
//        return updatedItem != null
//                ? ResponseEntity.ok(updatedItem)
//                : ResponseEntity.notFound().build();
//    }
//
//    public ResponseEntity<Void> deleteItem(@PathVariable Long itemId) {
//        service.deleteCourseItem(itemId);
//        return ResponseEntity.noContent().build();
//    }
//}
