package ma.emsi.emstudy.Controller;

import lombok.RequiredArgsConstructor;
import ma.emsi.emstudy.Entity.CompletedCourseItem;
import ma.emsi.emstudy.Entity.CourseItem;
import ma.emsi.emstudy.Service.CompletedCourseItemService;
import ma.emsi.emstudy.Service.CourseItemService;
import org.apache.coyote.BadRequestException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/completed-items")
@RequiredArgsConstructor
public class CompletedCourseItemController {

    private final CompletedCourseItemService completedCourseItemService;

    @PostMapping("/")
    public ResponseEntity<?> markItemAsCompleted(
            @RequestParam Long studentId,
            @RequestParam Long courseItemId) {
        CompletedCourseItem completed = null;
        try {
            completed = completedCourseItemService.markItemAsCompleted(studentId, courseItemId);
        } catch (BadRequestException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
        return ResponseEntity.ok(completed);
    }

    @GetMapping("/course/{courseId}/student/{studentId}")
    public ResponseEntity<List<CompletedCourseItem>> getCompletedItemsByCourseAndStudent(
            @PathVariable Long courseId,
            @PathVariable Long studentId) {
        List<CompletedCourseItem> items = null;
        try {
            items = completedCourseItemService.getCompletedItemsByCourseAndStudent(courseId, studentId);
        } catch (BadRequestException e) {
            return ResponseEntity.badRequest().body(null);
        }
        return ResponseEntity.ok(items);
    }

    @GetMapping("/{completedItemId}")
    public ResponseEntity<CompletedCourseItem> getCompletedItem(@PathVariable Long completedItemId) {
        return completedCourseItemService.findById(completedItemId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{completedItemId}")
    public ResponseEntity<Void> removeCompletedItem(@PathVariable Long completedItemId) {
        completedCourseItemService.delete(completedItemId);
        return ResponseEntity.noContent().build();
    }
}