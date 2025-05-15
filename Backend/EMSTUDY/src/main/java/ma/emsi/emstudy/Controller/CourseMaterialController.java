package ma.emsi.emstudy.Controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import ma.emsi.emstudy.Entity.CourseMaterial;
import ma.emsi.emstudy.Entity.CourseMaterialType;
import ma.emsi.emstudy.Exception.InvalidInputException;
import ma.emsi.emstudy.Service.CourseMaterialService;
import ma.emsi.emstudy.Service.CourseService;
import ma.emsi.emstudy.Service.FileStorageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/materials")
@RequiredArgsConstructor
@Tag(name = "Course Materials", description = "APIs for managing course materials and file uploads")
@SecurityRequirement(name = "bearerAuth")
public class CourseMaterialController {

    private final CourseService courseService;
    private final FileStorageService fileStorageService;
    private final CourseMaterialService courseMaterialService;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @Operation(
        summary = "Create new course material",
        description = "Upload a file and create a new course material",
        responses = {
            @ApiResponse(responseCode = "200", description = "Material created successfully"),
            @ApiResponse(responseCode = "403", description = "User is not the course teacher"),
            @ApiResponse(responseCode = "400", description = "Invalid input or file upload failed")
        }
    )
    @PostMapping
    public ResponseEntity<CourseMaterial> createMaterial(
            @Parameter(description = "File to upload") @RequestParam("file") MultipartFile file,
            @Parameter(description = "Title of the material") @RequestParam("title") String title,
            @Parameter(description = "ID of the course") @RequestParam("courseId") Long courseId,
            @RequestAttribute("userId") Long userId
    ) throws IOException {
        if (!courseService.isTeacherOfCourse(userId, courseId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        String fileName = fileStorageService.storeFile(file);

        CourseMaterial material = new CourseMaterial();
        material.setTitle(title);

        CourseMaterialType materialType = CourseMaterialType.from(file.getContentType());
        System.out.println("Resolved material type: " + materialType);

        material.setCourseMaterialType(materialType);
        material.setUrl(uploadDir + "/" + fileName);

        try {
            return ResponseEntity.ok(courseMaterialService.addCourseItem(material, courseId));
        } catch (Exception e) {
            System.err.println("Error saving material: " + e.getMessage());
            throw new InvalidInputException("Failed to save material: " + e.getMessage());
        }
    }

    @Operation(
        summary = "Download course material",
        description = "Download a specific course material file",
        responses = {
            @ApiResponse(responseCode = "200", description = "File downloaded successfully"),
            @ApiResponse(responseCode = "404", description = "Material not found")
        }
    )
    @GetMapping("/{materialId}")
    public ResponseEntity<UrlResource> downloadMaterial(
            @Parameter(description = "ID of the material to download") @PathVariable Long materialId) {
        UrlResource resource = fileStorageService.downloadMaterial(materialId);
        String contentType = fileStorageService.getMaterialContentType(materialId);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    @Operation(
            summary = "View course material image",
            description = "View an image course material directly in the browser",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Image displayed successfully"),
                    @ApiResponse(responseCode = "400", description = "Material is not an image"),
                    @ApiResponse(responseCode = "404", description = "Material not found")
            }
    )
    @GetMapping("/image/{materialId}")
    public ResponseEntity<UrlResource> viewImage(
            @Parameter(description = "ID of the image material to view") @PathVariable Long materialId) {
        CourseMaterial material = courseMaterialService.getCourseItemById(materialId);
        if (material.getCourseMaterialType() != CourseMaterialType.IMAGE) {
            return ResponseEntity.badRequest().build();
        }

        UrlResource resource = fileStorageService.downloadMaterial(materialId);
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .body(resource);
    }

    @Operation(
            summary = "View markdown material",
            description = "View a markdown course material directly in the browser",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Markdown displayed successfully"),
                    @ApiResponse(responseCode = "400", description = "Material is not markdown"),
                    @ApiResponse(responseCode = "404", description = "Material not found")
            }
    )
    @GetMapping("/markdown/{materialId}")
    public ResponseEntity<UrlResource> viewMarkdown(
            @Parameter(description = "ID of the markdown material to view") @PathVariable Long materialId) {
        CourseMaterial material = courseMaterialService.getCourseItemById(materialId);
        if (material.getCourseMaterialType() != CourseMaterialType.MARKDOWN) {
            return ResponseEntity.badRequest().build();
        }

        UrlResource resource = fileStorageService.downloadMaterial(materialId);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("text/markdown"))
                .body(resource);
    }


    @Operation(
        summary = "Get materials by course",
        description = "Retrieve all materials for a specific course",
        responses = {
            @ApiResponse(responseCode = "200", description = "List of materials retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Course not found")
        }
    )
    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<CourseMaterial>> getItemsByCourse(
            @Parameter(description = "ID of the course") @PathVariable Long courseId) {
        return ResponseEntity.ok(courseMaterialService.getCourseItemsByCourseId(courseId));
    }

    @Operation(
        summary = "Update course material",
        description = "Update an existing course material",
        responses = {
            @ApiResponse(responseCode = "200", description = "Material updated successfully"),
            @ApiResponse(responseCode = "403", description = "User is not the course teacher"),
            @ApiResponse(responseCode = "404", description = "Material not found")
        }
    )
    @PutMapping("/{itemId}")
    public ResponseEntity<CourseMaterial> updateItem(
            @Parameter(description = "ID of the material to update") @PathVariable Long itemId,
            @Parameter(description = "Updated material details") @RequestBody CourseMaterial item,
            @RequestAttribute("userId") Long userId) {
        if (!courseService.isTeacherOfCourse(userId, item.getCourse().getCourseId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(courseMaterialService.updateCourseItem(itemId, item));
    }

    @Operation(
        summary = "Delete course material",
        description = "Delete a specific course material",
        responses = {
            @ApiResponse(responseCode = "204", description = "Material deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Material not found")
        }
    )
    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> deleteItem(
            @Parameter(description = "ID of the material to delete") @PathVariable Long itemId) {
        courseMaterialService.deleteCourseItem(itemId);
        return ResponseEntity.noContent().build();
    }

}
