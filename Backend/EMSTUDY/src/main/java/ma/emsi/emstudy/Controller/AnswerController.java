package ma.emsi.emstudy.Controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.emsi.emstudy.Entity.Answer;
import ma.emsi.emstudy.Exception.ResourceNotFoundException;
import ma.emsi.emstudy.Service.AnswerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class AnswerController {

    private final AnswerService answerService;

    @PostMapping("/questions/{questionId}")
    public ResponseEntity<Answer> createAnswer(
            @PathVariable Long questionId,
            @Valid @RequestBody Answer answer) {
        Answer createdAnswer = answerService.createAnswer(answer, questionId);
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(createdAnswer.getAnswerId())
                .toUri();
        return ResponseEntity.created(location).body(createdAnswer);
    }

    @GetMapping("/questions/{questionId}")
    public ResponseEntity<List<Answer>> getAnswersByQuestion(@PathVariable Long questionId) {
        List<Answer> answers = answerService.getAnswersByQuestionId(questionId);
        return ResponseEntity.ok(answers);
    }

    @GetMapping("/{answerId}")
    public ResponseEntity<Answer> getAnswerById(@PathVariable Long answerId) {
        Answer answer = answerService.getAnswerById(answerId).orElseThrow(
                () -> new ResourceNotFoundException("Answer not found with id: " + answerId));
        return ResponseEntity.ok(answer);
    }

    @PutMapping("/{answerId}")
    public ResponseEntity<Answer> updateAnswer(
            @PathVariable Long answerId,
            @Valid @RequestBody Answer answer) {
        Answer updatedAnswer = answerService.updateAnswer(answerId, answer);
        return updatedAnswer != null
                ? ResponseEntity.ok(updatedAnswer)
                : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{answerId}")
    public ResponseEntity<Void> deleteAnswer(@PathVariable Long answerId) {
        answerService.deleteAnswer(answerId);
        return ResponseEntity.noContent().build();
    }
}
