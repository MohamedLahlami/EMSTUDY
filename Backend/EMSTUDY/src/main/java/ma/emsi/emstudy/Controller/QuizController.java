package ma.emsi.emstudy.Controller;

import lombok.RequiredArgsConstructor;
import ma.emsi.emstudy.Entity.Quiz;
import ma.emsi.emstudy.Entity.Question;
import ma.emsi.emstudy.Service.CourseItemService;
import ma.emsi.emstudy.Service.QuizService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/quizzes")
@RequiredArgsConstructor
public class QuizController {

    private final CourseItemService<Quiz> courseItemService;
    private final QuizService quizService;


    @PostMapping
    public ResponseEntity<Quiz> createQuiz(
            @Valid @RequestBody Quiz quiz,
            @RequestParam Long courseId,
            @RequestAttribute("userId") Long userId
    ) {
        return ResponseEntity.ok(quizService.createQuiz(quiz, courseId, userId));
    }

    @PostMapping("/{quizId}/questions")
    public ResponseEntity<Quiz> addQuestion(
            @PathVariable Long quizId,
            @Valid @RequestBody Question question,
            @RequestAttribute("userId") Long userId
    ) {
        return ResponseEntity.ok(quizService.addQuestion(quizId, question, userId));
    }

    @DeleteMapping("/{quizId}/questions/{questionId}")
    public ResponseEntity<Void> deleteQuestion(
            @PathVariable Long quizId,
            @PathVariable Long questionId,
            @RequestAttribute("userId") Long userId
    ) {
        quizService.deleteQuestion(quizId, questionId, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{quizId}/start")
    public ResponseEntity<Quiz> startQuiz(
            @PathVariable Long quizId,
            @RequestAttribute("userId") Long userId
    ) {
        return ResponseEntity.ok(quizService.startQuiz(quizId, userId));
    }

    @PostMapping("/{quizId}/submit")
    public ResponseEntity<Integer> submitQuiz(
            @PathVariable Long quizId,
            @RequestBody List<Long> answers,
            @RequestAttribute("userId") Long userId
    ) {
        return ResponseEntity.ok(quizService.submitQuiz(quizId, answers, userId));
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long itemId) {
        if (courseItemService.getCourseItemById(itemId).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        courseItemService.deleteCourseItem(itemId);
        return ResponseEntity.noContent().build();
    }
}
