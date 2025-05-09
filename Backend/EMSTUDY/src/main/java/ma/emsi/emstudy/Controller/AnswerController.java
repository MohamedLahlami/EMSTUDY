package ma.emsi.emstudy.Controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.emsi.emstudy.Entity.Answer;
import ma.emsi.emstudy.Exception.ResourceNotFoundException;
import ma.emsi.emstudy.Service.AnswerService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/answers")
@Tag(name = "Answer Management", description = "APIs for managing question answers")
@SecurityRequirement(name = "bearerAuth")
public class AnswerController {

    private final AnswerService answerService;

    @Operation(
        summary = "Create a new answer",
        description = "Creates a new answer for a specific question",
        responses = {
            @ApiResponse(responseCode = "201", description = "Answer created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input"),
            @ApiResponse(responseCode = "404", description = "Question not found")
        }
    )
    @PostMapping("/question/{questionId}")
    public ResponseEntity<Answer> createAnswer(
            @Parameter(description = "ID of the question") @PathVariable Long questionId,
            @Parameter(description = "Answer details") @RequestBody Answer answer) {
        Answer createdAnswer = answerService.createAnswer(answer, questionId);
        return new ResponseEntity<>(createdAnswer, HttpStatus.CREATED);
    }

    @Operation(
        summary = "Get answers by question",
        description = "Retrieves all answers for a specific question",
        responses = {
            @ApiResponse(responseCode = "200", description = "List of answers retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Question not found")
        }
    )
    @GetMapping("/question/{questionId}")
    public ResponseEntity<List<Answer>> getAnswersByQuestion(
            @Parameter(description = "ID of the question") @PathVariable Long questionId) {
        List<Answer> answers = answerService.getAnswersByQuestionId(questionId);
        return ResponseEntity.ok(answers);
    }

    @Operation(
        summary = "Get answer by ID",
        description = "Retrieves a specific answer by its ID",
        responses = {
            @ApiResponse(responseCode = "200", description = "Answer found and returned"),
            @ApiResponse(responseCode = "404", description = "Answer not found")
        }
    )
    @GetMapping("/{answerId}")
    public ResponseEntity<Answer> getAnswerById(
            @Parameter(description = "ID of the answer to retrieve") @PathVariable Long answerId) {
        Answer answer = answerService.getAnswerById(answerId).orElseThrow(
                () -> new ResourceNotFoundException("Answer not found with id: " + answerId));
        return ResponseEntity.ok(answer);
    }

    @Operation(
        summary = "Update answer",
        description = "Updates an existing answer",
        responses = {
            @ApiResponse(responseCode = "200", description = "Answer updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input"),
            @ApiResponse(responseCode = "404", description = "Answer not found")
        }
    )
    @PutMapping("/{answerId}")
    public ResponseEntity<Answer> updateAnswer(
            @Parameter(description = "ID of the answer to update") @PathVariable Long answerId,
            @Parameter(description = "Updated answer details") @RequestBody Answer answer) {
        return ResponseEntity.ok(answerService.updateAnswer(answerId, answer));
    }

    @Operation(
        summary = "Delete answer",
        description = "Deletes a specific answer",
        responses = {
            @ApiResponse(responseCode = "204", description = "Answer deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Answer not found")
        }
    )
    @DeleteMapping("/{answerId}")
    public ResponseEntity<Void> deleteAnswer(
            @Parameter(description = "ID of the answer to delete") @PathVariable Long answerId) {
        answerService.deleteAnswer(answerId);
        return ResponseEntity.noContent().build();
    }
}
