package ma.emsi.emstudy.Controller;

import lombok.RequiredArgsConstructor;
import ma.emsi.emstudy.Entity.CourseMaterial;
import ma.emsi.emstudy.Entity.CourseMaterialType;
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
public class CourseMaterialController extends CourseItemController<CourseMaterial> {
    private final CourseService courseService;
    private final FileStorageService fileStorageService;
    private final CourseMaterialService courseMaterialService = (CourseMaterialService)service;

    public CourseMaterialController(CourseMaterialService service, CourseService courseService,  FileStorageService fileStorageService) {
        super(service);
        this.courseService = courseService;
        this.fileStorageService = fileStorageService;
    }

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

    @Override
    @GetMapping("/courses/{courseId}")
    public ResponseEntity<List<CourseMaterial>> getItemsByCourse(@PathVariable Long courseId) {
        return super.getItemsByCourse(courseId);
    }

    @Override
    @GetMapping("/{itemId}")
    public ResponseEntity<CourseMaterial> getItem(@PathVariable Long itemId) {
        return super.getItem(itemId);
    }

    @Override
    @PutMapping("/{itemId}")
    public ResponseEntity<CourseMaterial> updateItem(@PathVariable Long itemId, @RequestBody CourseMaterial item) {
        return super.updateItem(itemId, item);
    }

    @Override
    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long itemId) {
        return super.deleteItem(itemId);
    }
}