package ma.emsi.emstudy.Controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import ma.emsi.emstudy.Entity.CompletedCourseItem;
import ma.emsi.emstudy.Service.CompletedCourseItemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/completed-items")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Completed Course Items", description = "APIs for managing completed course items")
public class CompletedCourseItemController {

    private final CompletedCourseItemService completedCourseItemService;

    @Operation(
        summary = "Mark item as completed",
        description = "Marks a course item as completed for the current student",
        responses = {
            @ApiResponse(responseCode = "200", description = "Item marked as completed successfully"),
            @ApiResponse(responseCode = "404", description = "Course item not found"),
            @ApiResponse(responseCode = "400", description = "Invalid request")
        }
    )
    @PostMapping("/")
    public ResponseEntity<?> markItemAsCompleted(
            @Parameter(description = "ID of the course item to mark as completed") @RequestParam Long itemId,
            @RequestAttribute("userId") Long studentId) {
        CompletedCourseItem completed = completedCourseItemService.markItemAsCompleted(studentId, itemId);
        return ResponseEntity.ok(completed);
    }

    @Operation(
        summary = "Get completed items by course",
        description = "Retrieves all completed items for a specific course and student",
        responses = {
            @ApiResponse(responseCode = "200", description = "List of completed items retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Course not found")
        }
    )
    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<CompletedCourseItem>> getCompletedItemsByCourseAndStudent(
            @Parameter(description = "ID of the course") @PathVariable Long courseId,
            @RequestAttribute("userId") Long studentId) {
        List<CompletedCourseItem> items = completedCourseItemService.getCompletedItemsByCourseAndStudent(studentId, courseId);
        return ResponseEntity.ok(items);
    }

    @Operation(
        summary = "Get completed item by ID",
        description = "Retrieves a specific completed item by its ID",
        responses = {
            @ApiResponse(responseCode = "200", description = "Completed item found and returned"),
            @ApiResponse(responseCode = "404", description = "Completed item not found")
        }
    )
    @GetMapping("/{completedItemId}")
    public ResponseEntity<CompletedCourseItem> getCompletedItem(
            @Parameter(description = "ID of the completed item") @PathVariable Long completedItemId) {
        return completedCourseItemService.findById(completedItemId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(
        summary = "Delete completed item",
        description = "Removes a completed item record",
        responses = {
            @ApiResponse(responseCode = "204", description = "Completed item deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Completed item not found")
        }
    )
    @DeleteMapping("/{completedItemId}")
    public ResponseEntity<Void> removeCompletedItem(
            @Parameter(description = "ID of the completed item to delete") @PathVariable Long completedItemId) {
        completedCourseItemService.delete(completedItemId);
        return ResponseEntity.noContent().build();
    }
}
