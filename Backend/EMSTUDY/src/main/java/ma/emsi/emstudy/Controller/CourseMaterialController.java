package ma.emsi.emstudy.Controller;

import lombok.RequiredArgsConstructor;
import ma.emsi.emstudy.Entity.CourseMaterial;
import ma.emsi.emstudy.Entity.CourseMaterialType;
import ma.emsi.emstudy.Service.CourseItemService;
import ma.emsi.emstudy.Service.CourseMaterialService;
import ma.emsi.emstudy.Service.CourseService;
import ma.emsi.emstudy.Service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
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
        System.out.println("Creating material with title: " + title + " for courseId: " + courseId);
        if (!courseService.isTeacherOfCourse(userId, courseId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        String fileName = fileStorageService.storeFile(file);

        CourseMaterial material = new CourseMaterial();
        material.setTitle(title);
        material.setCourseMaterialType(CourseMaterialType.from(file.getContentType()));
        material.setUrl(uploadDir + fileName);
        return ResponseEntity.ok(courseMaterialService.addCourseItem(material, courseId));
    }

    @GetMapping("/courses/{courseId}")
    public ResponseEntity<List<CourseMaterial>> getItemsByCourse(@PathVariable Long courseId) {
        return getItemsByCourse(courseId);
    }

    @GetMapping("/{itemId}")
    public ResponseEntity<CourseMaterial> getItem(@PathVariable Long itemId) {
        return super.getItem(itemId);
    }

    @PutMapping("/{itemId}")
    public ResponseEntity<CourseMaterial> updateItem(@PathVariable Long itemId, @RequestBody CourseMaterial item) {
        return super.updateItem(itemId, item);
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long itemId) {
        if (courseMaterialService.getCourseItemById(itemId).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        courseMaterialService.deleteCourseItem(itemId);
        return ResponseEntity.noContent().build();
    }
}