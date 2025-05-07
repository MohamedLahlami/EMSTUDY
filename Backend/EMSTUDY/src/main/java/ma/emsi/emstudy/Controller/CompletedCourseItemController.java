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
            @RequestParam Long itemId,
            @RequestAttribute("userId") Long studentId) {
        CompletedCourseItem completed = completedCourseItemService.markItemAsCompleted(studentId, itemId);
        return ResponseEntity.ok(completed);
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<CompletedCourseItem>> getCompletedItemsByCourseAndStudent(
            @PathVariable Long courseId,
            @RequestAttribute("userId") Long studentId) {
        List<CompletedCourseItem> items = completedCourseItemService.getCompletedItemsByCourseAndStudent(studentId, courseId);
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