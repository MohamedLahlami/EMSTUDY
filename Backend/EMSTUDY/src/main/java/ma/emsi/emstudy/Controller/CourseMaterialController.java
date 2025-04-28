package ma.emsi.emstudy.Controller;

import ma.emsi.emstudy.Entity.CourseMaterial;
import ma.emsi.emstudy.Service.CourseMaterialService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/course-materials")
public class CourseMaterialController extends CourseItemController<CourseMaterial> {

    public CourseMaterialController(CourseMaterialService service) {
        super(service);
    }

    @PostMapping
    public ResponseEntity<CourseMaterial> createMaterial(@RequestBody CourseMaterial material) {
        return ResponseEntity.ok(service.addCourseItem(material));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CourseMaterial> updateMaterial(@PathVariable Long id, @RequestBody CourseMaterial material) {
        CourseMaterial updated = service.updateCourseItem(id, material);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }
}
