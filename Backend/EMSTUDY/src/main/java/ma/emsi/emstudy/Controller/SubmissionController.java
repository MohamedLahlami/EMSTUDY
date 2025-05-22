package ma.emsi.emstudy.Controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import ma.emsi.emstudy.Entity.*;
import ma.emsi.emstudy.Exception.ForbiddenAccessException;
import ma.emsi.emstudy.Exception.ResourceNotFoundException;
import ma.emsi.emstudy.Service.StudentService;
import ma.emsi.emstudy.Service.SubmissionService;
import ma.emsi.emstudy.Service.TeacherService; // Added import
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/submissions")
@RequiredArgsConstructor
@Tag(name = "Submissions", description = "APIs for managing quiz submissions")
@SecurityRequirement(name = "bearerAuth")
public class SubmissionController {

    private final SubmissionService submissionService;
    private final StudentService studentService;
    private final TeacherService teacherService; // Added TeacherService

    @Operation(
        summary = "Get all submissions",
        description = "Retrieve all quiz submissions in the system",
        responses = {
            @ApiResponse(responseCode = "200", description = "List of submissions retrieved successfully")
        }
    )
    @GetMapping("/all")
    public ResponseEntity<List<Submission>> getAllSubmissions() {
        return ResponseEntity.ok(submissionService.getAllSubmissions());
    }

    @Operation(
            summary = "Get current user's submissions",
            description = "Retrieve all submissions for the currently authenticated user",
            responses = {
                    @ApiResponse(responseCode = "200", description = "List of user's submissions retrieved successfully")
            }
    )
    @GetMapping
    public ResponseEntity<List<Submission>> getCurrentUserSubmissions(@RequestAttribute("userId") Long studentId) {
        Student student = studentService.getStudent(studentId);
        return ResponseEntity.ok(submissionService.getSubmissionsByStudent(student.getUserId()));
    }


    @Operation(
        summary = "Get submission by ID",
        description = "Retrieve a specific submission by its ID",
        responses = {
            @ApiResponse(responseCode = "200", description = "Submission found and returned"),
            @ApiResponse(responseCode = "404", description = "Submission not found")
        }
    )
    @GetMapping("/{id}")
    public ResponseEntity<Submission> getSubmissionBySubmissionId(
            @Parameter(description = "ID of the submission") @PathVariable Long id) {
        return submissionService.getSubmissionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(
        summary = "Get the current student's submission by quiz",
        description = "Retrieve a submission for a specific quiz and student",
        responses = {
            @ApiResponse(responseCode = "200", description = "Submission found and returned"),
            @ApiResponse(responseCode = "404", description = "Submission not found")
        }
    )
    @GetMapping("/quiz/{quizId}")
    public ResponseEntity<Submission> getSubmissionByQuizAndStudent(
            @Parameter(description = "ID of the quiz") @PathVariable Long quizId,
            @RequestAttribute("userId") Long studentId) {
        Submission submission = submissionService.getSubmissionByQuizAndStudent(studentId, quizId);
        if (submission == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(submission);
    }

    @Operation(
        summary = "Start new submission",
        description = "Start a new quiz submission for a student",
        responses = {
            @ApiResponse(responseCode = "201", description = "Submission started successfully"),
            @ApiResponse(responseCode = "404", description = "Quiz or student not found")
        }
    )
    @PostMapping("/start/")
    public ResponseEntity<Submission> startSubmission(
            @Parameter(description = "ID of the quiz") @RequestParam Long quizId,
            @RequestAttribute("userId") Long studentId) {
        Student student = studentService.getStudent(studentId);
        return new ResponseEntity<>(submissionService.startSubmission(student, quizId), HttpStatus.CREATED);
    }

    @Operation(
        summary = "Submit answers",
        description = "Submit answers for an existing submission",
        responses = {
            @ApiResponse(responseCode = "201", description = "Answers submitted successfully"),
            @ApiResponse(responseCode = "403", description = "Forbidden access"),
            @ApiResponse(responseCode = "404", description = "Submission not found")
        }
    )
    @PutMapping("/{submissionId}")
    public ResponseEntity<Submission> submitSubmission(
            @Parameter(description = "ID of the submission") @PathVariable Long submissionId,
            @Parameter(description = "List of answer Ids") @RequestBody List<Long> answerIds,
            @RequestAttribute("userId") Long studentId) {
        Submission submission = submissionService.getSubmissionById(submissionId).orElseThrow(() -> new ResourceNotFoundException("Submission not found"));
        if (!studentId.equals(submission.getStudent().getUserId())){
            throw new ForbiddenAccessException("You are not allowed to submit this submission");
        }
        return new ResponseEntity<>(submissionService.submitSubmission(submissionId, answerIds), HttpStatus.CREATED);
    }

    @Operation(
            summary = "Delete submission",
            description = "Delete a specific submission",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Submission deleted successfully"),
                    @ApiResponse(responseCode = "403", description = "User not authorized to delete this submission"),
                    @ApiResponse(responseCode = "404", description = "Submission not found")
            }
    )
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubmission(
            @Parameter(description = "ID of the submission") @PathVariable Long id,
            @RequestAttribute("userId") Long studentId) {
        Submission submission = submissionService.getSubmissionById(id).orElseThrow(() -> new ResourceNotFoundException("Submission not found"));
        if (!studentId.equals(submission.getStudent().getUserId())) {
            throw new ForbiddenAccessException("You are not allowed to delete this submission");
        }
        submissionService.deleteSubmission(id);
        return ResponseEntity.ok().build();
    }
}
