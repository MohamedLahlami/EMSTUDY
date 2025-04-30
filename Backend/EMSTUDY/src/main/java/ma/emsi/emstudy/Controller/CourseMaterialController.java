package ma.emsi.emstudy.Controller;

import ma.emsi.emstudy.Entity.CourseMaterial;
import ma.emsi.emstudy.Service.CourseMaterialService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/materials")
public class CourseMaterialController extends CourseItemController<CourseMaterial> {

    public CourseMaterialController(CourseMaterialService service) {
        super(service);
    }

    @Override
    @PostMapping("/courses/{courseId}")
    public ResponseEntity<CourseMaterial> createItem(@PathVariable Long courseId, @RequestBody CourseMaterial material) {
        return super.createItem(courseId, material);
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