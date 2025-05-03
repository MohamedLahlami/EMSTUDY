package ma.emsi.emstudy.Controller;

import lombok.RequiredArgsConstructor;
import ma.emsi.emstudy.DTO.SubmissionDTO;
import ma.emsi.emstudy.Entity.*;
import ma.emsi.emstudy.Repository.UserRepo;
import ma.emsi.emstudy.Service.SubmissionService;
import org.apache.coyote.BadRequestException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/submissions")
@RequiredArgsConstructor
@CrossOrigin("*")
public class SubmissionController {

    private final SubmissionService submissionService;
    private final UserRepo userRepo;

    @GetMapping
    public ResponseEntity<List<Submission>> getAllSubmissions() {
        return ResponseEntity.ok(submissionService.getAllSubmissions());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Submission> getSubmissionById(@PathVariable Long id) {
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

    @PostMapping
    public ResponseEntity<Submission> createSubmission(@RequestAttribute("userId") Long studentId, @RequestBody SubmissionDTO submissionDTO) {
        if (studentId == null) {
            return ResponseEntity.badRequest().body(null);
        }
        User user  = userRepo.findById(studentId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        if(!(user instanceof Student student)) { throw new IllegalArgumentException("User is not a student");}
        Submission createdSubmission = submissionService.createSubmission(
                student,
                submissionDTO.getAnswers()
        );
        return ResponseEntity.ok(createdSubmission);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubmission(@PathVariable Long id) {
        submissionService.deleteSubmission(id);
        return ResponseEntity.ok().build();
    }
}
