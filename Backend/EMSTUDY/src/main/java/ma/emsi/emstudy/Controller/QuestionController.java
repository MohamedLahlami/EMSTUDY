package ma.emsi.emstudy.Controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.emsi.emstudy.Entity.Question;
import ma.emsi.emstudy.Service.QuestionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/questions")
public class QuestionController {

    private final QuestionService questionService;

    @GetMapping("/")
    public ResponseEntity<List<Question>> getAllQuestions() {
        List<Question> questions = questionService.getAllQuestions();
        return ResponseEntity.ok(questions);
    }

    @GetMapping("/{questionId}")
    public ResponseEntity<Question> getQuestionById(@PathVariable Long questionId) {
        return questionService.getQuestionById(questionId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/quiz/{quizId}")
    public ResponseEntity<List<Question>> getQuestionsByQuizId(@PathVariable Long quizId) {
        List<Question> questions = questionService.getQuestionsByQuizId(quizId);
        return ResponseEntity.ok(questions);
    }

    @PutMapping("/{questionId}")
    public ResponseEntity<Question> updateQuestion(
            @PathVariable Long questionId,
            @Valid @RequestBody Question questionDetails) {
        Question updatedQuestion = questionService.updateQuestion(questionId, questionDetails);
        return ResponseEntity.ok(updatedQuestion);
    }

    @DeleteMapping("/{questionId}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long questionId) {
        questionService.deleteQuestion(questionId);
        return ResponseEntity.noContent().build();
    }
}
