package ma.emsi.emstudy.Controller;

import ma.emsi.emstudy.Entity.Answer;
import ma.emsi.emstudy.Entity.Quiz;
import ma.emsi.emstudy.Service.QuizService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quizzes")
public class QuizController extends CourseItemController<Quiz> {

    public QuizController(QuizService service) {
        super(service);
    }

    @PostMapping
    public ResponseEntity<Quiz> createQuiz(@RequestBody Quiz quiz) {
        return ResponseEntity.ok(service.addCourseItem(quiz));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Quiz> updateQuiz(@PathVariable Long id, @RequestBody Quiz quiz) {
        Quiz updated = service.updateCourseItem(id, quiz);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }
}
