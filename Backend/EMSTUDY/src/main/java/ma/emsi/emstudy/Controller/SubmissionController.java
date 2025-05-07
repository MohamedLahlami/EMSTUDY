package ma.emsi.emstudy.Controller;

import lombok.RequiredArgsConstructor;
import ma.emsi.emstudy.Entity.*;
import ma.emsi.emstudy.Exception.ForbiddenAccessException;
import ma.emsi.emstudy.Exception.ResourceNotFoundException;
import ma.emsi.emstudy.Service.StudentService;
import ma.emsi.emstudy.Service.SubmissionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/submissions")
@RequiredArgsConstructor
public class SubmissionController {

    private final SubmissionService submissionService;
    private final StudentService studentService;

    @GetMapping
    public ResponseEntity<List<Submission>> getAllSubmissions() {
        return ResponseEntity.ok(submissionService.getAllSubmissions());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Submission> getSubmissionBySubmissionId(@PathVariable Long id) {
        return submissionService.getSubmissionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/student/{studentId}/quiz/{quizId}")
    public ResponseEntity<Submission> getSubmissionByQuizAndStudent(
            @PathVariable Long quizId,
            @PathVariable Long studentId) {
        Submission submission = submissionService.getSubmissionsByQuizAndStudent(quizId, studentId);
        if (submission == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(submission);
    }

    @PostMapping("/start/")
    public ResponseEntity<Submission> startSubmission(@RequestParam Long quizId, @RequestAttribute("userId") Long studentId) {
        Student student = studentService.getStudent(studentId);
        return new ResponseEntity<>(submissionService.startSubmission(student, quizId), HttpStatus.CREATED);
    }

    @PutMapping("/{submissionId}")
    public ResponseEntity<Submission> submitSubmission(@PathVariable Long submissionId, @RequestBody List<Answer> answers, @RequestAttribute("userId") Long studentId) {
        Student student = studentService.getStudent(studentId);
        Submission submission = submissionService.getSubmissionById(submissionId).orElseThrow(() -> new ResourceNotFoundException("Submission not found"));
        if (!studentId.equals(submission.getStudent().getUserId())){
            throw new ForbiddenAccessException("You are not allowed to submit this submission");
        }
        return new ResponseEntity<>(submissionService.submitSubmission(submissionId, answers), HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubmission(@PathVariable Long id) {
        submissionService.deleteSubmission(id);
        return ResponseEntity.ok().build();
    }
}
