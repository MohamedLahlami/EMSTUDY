package ma.emsi.emstudy.Controller;

import lombok.RequiredArgsConstructor;
import ma.emsi.emstudy.Entity.CompletedCourseItem;
import ma.emsi.emstudy.Service.CompletedCourseItemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/completed-items")
@RequiredArgsConstructor
public class CompletedCourseItemController {

    private final CompletedCourseItemService completedCourseItemService;

    @PostMapping("/")
    public ResponseEntity<CompletedCourseItem> markItemAsCompleted(
            @RequestParam Long studentId,
            @RequestParam Long courseItemId) {
        CompletedCourseItem completed = completedCourseItemService.markItemAsCompleted(studentId, courseItemId);
        return ResponseEntity.ok(completed);
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<CompletedCourseItem>> getCompletedItemsByStudent(@PathVariable Long studentId) {
        List<CompletedCourseItem> items = completedCourseItemService.getCompletedItemsByStudentId(studentId);
        return ResponseEntity.ok(items);
    }

    @GetMapping("/course/{courseId}/student/{studentId}")
    public ResponseEntity<List<CompletedCourseItem>> getCompletedItemsByCourseAndStudent(
            @PathVariable Long courseId,
            @PathVariable Long studentId) {
        List<CompletedCourseItem> items = completedCourseItemService.getCompletedItemsByCourseAndStudent(courseId, studentId);
        return ResponseEntity.ok(items);
    }

    @GetMapping("/{completedItemId}")
    public ResponseEntity<CompletedCourseItem> getCompletedItem(@PathVariable Long completedItemId) {
        return completedCourseItemService.getCompletedItemById(completedItemId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{completedItemId}")
    public ResponseEntity<Void> removeCompletedItem(@PathVariable Long completedItemId) {
        completedCourseItemService.deleteCompletedItem(completedItemId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/verify")
    public ResponseEntity<Boolean> verifyItemCompletion(
            @RequestParam Long studentId,
            @RequestParam Long courseItemId) {
        boolean isCompleted = completedCourseItemService.isItemCompletedByStudent(studentId, courseItemId);
        return ResponseEntity.ok(isCompleted);
    }
}