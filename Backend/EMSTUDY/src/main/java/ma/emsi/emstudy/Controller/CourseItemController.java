package ma.emsi.emstudy.Controller;

import lombok.RequiredArgsConstructor;
import ma.emsi.emstudy.Entity.CourseItem;
import ma.emsi.emstudy.Exception.ResourceNotFoundException;
import ma.emsi.emstudy.Service.CourseItemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/items")
@RequiredArgsConstructor
public class CourseItemController {

    private final CourseItemService<CourseItem> courseItemService;

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<CourseItem>> getItemsByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(courseItemService.getCourseItemsByCourseId(courseId));
    }

    @GetMapping("/{itemId}")
    public ResponseEntity<CourseItem> getItem(@PathVariable Long itemId) {
        CourseItem courseItem = courseItemService.getCourseItemById(itemId);
        return ResponseEntity.ok(courseItem);
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long itemId) {
        courseItemService.deleteCourseItem(itemId);
        return ResponseEntity.noContent().build();
    }
}
