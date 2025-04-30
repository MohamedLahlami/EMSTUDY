package ma.emsi.emstudy.Controller;

import ma.emsi.emstudy.Entity.Quiz;
import ma.emsi.emstudy.Service.QuizService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/quizzes")
public class QuizController extends CourseItemController<Quiz> {

    public QuizController(QuizService service) {
        super(service);
    }

    @Override
    @PostMapping("/courses/{courseId}")
    public ResponseEntity<Quiz> createItem(@PathVariable Long courseId, @RequestBody Quiz quiz) {
        return super.createItem(courseId, quiz);
    }

    @Override
    @GetMapping("/courses/{courseId}")
    public ResponseEntity<List<Quiz>> getItemsByCourse(@PathVariable Long courseId) {
        return super.getItemsByCourse(courseId);
    }

    @Override
    @GetMapping("/{itemId}")
    public ResponseEntity<Quiz> getItem(@PathVariable Long itemId) {
        return super.getItem(itemId);
    }

    @Override
    @PutMapping("/{itemId}")
    public ResponseEntity<Quiz> updateItem(@PathVariable Long itemId, @RequestBody Quiz quiz) {
        return super.updateItem(itemId, quiz);
    }

    @Override
    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long itemId) {
        return super.deleteItem(itemId);
    }

    // Quiz-specific endpoints can be added here
    @GetMapping("/{quizId}/start")
    public ResponseEntity<Quiz> startQuiz(@PathVariable Long quizId) {
        Quiz quiz = service.getCourseItemById(quizId);
        return ResponseEntity.ok(quiz);
    }
}