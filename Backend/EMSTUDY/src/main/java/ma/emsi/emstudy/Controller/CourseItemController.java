package ma.emsi.emstudy.Controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import ma.emsi.emstudy.Entity.CourseItem;
import ma.emsi.emstudy.Service.CourseItemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/items")
@RequiredArgsConstructor
@Tag(name = "Course Items", description = "generic APIs for managing course items (materials and quizzes)")
@SecurityRequirement(name = "bearerAuth")
public class CourseItemController {

    private final CourseItemService<CourseItem> courseItemService;

    @Operation(
        summary = "Get items by course",
        description = "Retrieves all items (materials and quizzes) for a specific course",
        responses = {
            @ApiResponse(responseCode = "200", description = "List of course items retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Course not found")
        }
    )
    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<CourseItem>> getItemsByCourse(
        @Parameter(description = "ID of the course") @PathVariable Long courseId) {
        return ResponseEntity.ok(courseItemService.getCourseItemsByCourseId(courseId));
    }

    @Operation(
        summary = "Get item by ID",
        description = "Retrieves a specific course item by its ID",
        responses = {
            @ApiResponse(responseCode = "200", description = "Course item found and returned"),
            @ApiResponse(responseCode = "404", description = "Course item not found")
        }
    )
    @GetMapping("/{itemId}")
    public ResponseEntity<CourseItem> getItem(
        @Parameter(description = "ID of the course item") @PathVariable Long itemId) {
        CourseItem courseItem = courseItemService.getCourseItemById(itemId);
        return ResponseEntity.ok(courseItem);
    }

    @Operation(
        summary = "Delete item",
        description = "Deletes a specific course item",
        responses = {
            @ApiResponse(responseCode = "204", description = "Course item deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Course item not found")
        }
    )
    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> deleteItem(
        @Parameter(description = "ID of the course item to delete") @PathVariable Long itemId) {
        courseItemService.deleteCourseItem(itemId);
        return ResponseEntity.noContent().build();
    }
}
