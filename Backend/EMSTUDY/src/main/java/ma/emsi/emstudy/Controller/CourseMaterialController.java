package ma.emsi.emstudy.Controller;

import lombok.RequiredArgsConstructor;
import ma.emsi.emstudy.Entity.CourseMaterial;
import ma.emsi.emstudy.Entity.CourseMaterialType;
import ma.emsi.emstudy.Exception.InvalidInputException;
import ma.emsi.emstudy.Service.CourseItemService;
import ma.emsi.emstudy.Service.CourseMaterialService;
import ma.emsi.emstudy.Service.CourseService;
import ma.emsi.emstudy.Service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
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
public class CourseMaterialController {

    private final CourseService courseService;
    private final FileStorageService fileStorageService;
    private final CourseMaterialService courseMaterialService;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @PostMapping
    public ResponseEntity<CourseMaterial> createMaterial(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam("courseId") Long courseId,
            @RequestAttribute("userId") Long userId
    ) throws IOException {
        if (!courseService.isTeacherOfCourse(userId, courseId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        String fileName = fileStorageService.storeFile(file);

        CourseMaterial material = new CourseMaterial();
        material.setTitle(title);
        
        CourseMaterialType materialType = CourseMaterialType.from(file.getContentType());
        System.out.println("Resolved material type: " + materialType); // Debug line
        
        material.setCourseMaterialType(materialType);
        material.setUrl(uploadDir + "/" + fileName);
        
        try {
            return ResponseEntity.ok(courseMaterialService.addCourseItem(material, courseId));
        } catch (Exception e) {
            System.err.println("Error saving material: " + e.getMessage());
            throw new InvalidInputException("Failed to save material: " + e.getMessage());
        }
    }

    @GetMapping("/{materialId}/download")
    public ResponseEntity<UrlResource> downloadMaterial(@PathVariable Long materialId) {
        UrlResource resource = fileStorageService.downloadMaterial(materialId);
        String contentType = fileStorageService.getMaterialContentType(materialId);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }


    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<CourseMaterial>> getItemsByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(courseMaterialService.getCourseItemsByCourseId(courseId));
    }

    @PutMapping("/{itemId}")
    public ResponseEntity<CourseMaterial> updateItem(@PathVariable Long itemId, @RequestBody CourseMaterial item, @RequestAttribute("userId") Long userId){
        if (!courseService.isTeacherOfCourse(userId, item.getCourse().getCourseId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(courseMaterialService.updateCourseItem(itemId, item));
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long itemId) {
        courseMaterialService.deleteCourseItem(itemId);
        return ResponseEntity.noContent().build();
    }

}