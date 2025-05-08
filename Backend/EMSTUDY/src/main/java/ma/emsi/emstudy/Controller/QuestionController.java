package ma.emsi.emstudy.Controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.emsi.emstudy.Entity.Question;
import ma.emsi.emstudy.Service.QuestionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/questions")
@Tag(name = "Questions", description = "APIs for managing quiz questions")
@SecurityRequirement(name = "bearerAuth")
public class QuestionController {

    private final QuestionService questionService;

    @Operation(
        summary = "Get all questions",
        description = "Retrieve all questions in the system",
        responses = {
            @ApiResponse(responseCode = "200", description = "List of questions retrieved successfully")
        }
    )
    @GetMapping("/")
    public ResponseEntity<List<Question>> getAllQuestions() {
        List<Question> questions = questionService.getAllQuestions();
        return ResponseEntity.ok(questions);
    }

    @Operation(
        summary = "Get question by ID",
        description = "Retrieve a specific question by its ID",
        responses = {
            @ApiResponse(responseCode = "200", description = "Question found and returned"),
            @ApiResponse(responseCode = "404", description = "Question not found")
        }
    )
    @GetMapping("/{questionId}")
    public ResponseEntity<Question> getQuestionById(
            @Parameter(description = "ID of the question") @PathVariable Long questionId) {
        return questionService.getQuestionById(questionId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(
        summary = "Get questions by quiz",
        description = "Retrieve all questions for a specific quiz",
        responses = {
            @ApiResponse(responseCode = "200", description = "List of questions retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Quiz not found")
        }
    )
    @GetMapping("/quiz/{quizId}")
    public ResponseEntity<List<Question>> getQuestionsByQuizId(
            @Parameter(description = "ID of the quiz") @PathVariable Long quizId) {
        List<Question> questions = questionService.getQuestionsByQuizId(quizId);
        return ResponseEntity.ok(questions);
    }

    @Operation(
        summary = "Update question",
        description = "Update an existing question",
        responses = {
            @ApiResponse(responseCode = "200", description = "Question updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input"),
            @ApiResponse(responseCode = "404", description = "Question not found")
        }
    )
    @PutMapping("/{questionId}")
    public ResponseEntity<Question> updateQuestion(
            @Parameter(description = "ID of the question") @PathVariable Long questionId,
            @Parameter(description = "Updated question details") @RequestBody Question questionDetails) {
        Question updatedQuestion = questionService.updateQuestion(questionId, questionDetails);
        return ResponseEntity.ok(updatedQuestion);
    }

    @Operation(
        summary = "Delete question",
        description = "Delete a specific question",
        responses = {
            @ApiResponse(responseCode = "204", description = "Question deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Question not found")
        }
    )
    @DeleteMapping("/{questionId}")
    public ResponseEntity<Void> deleteQuestion(
            @Parameter(description = "ID of the question") @PathVariable Long questionId) {
        questionService.deleteQuestion(questionId);
        return ResponseEntity.noContent().build();
    }
}
