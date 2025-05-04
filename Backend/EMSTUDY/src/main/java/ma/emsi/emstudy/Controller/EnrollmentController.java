package ma.emsi.emstudy.Controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.emsi.emstudy.Entity.Enrollment;
import ma.emsi.emstudy.Exception.InvalidInputException;
import ma.emsi.emstudy.Service.EnrollmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    @PostMapping("/enroll")
    public ResponseEntity<Enrollment> createEnrollment(@RequestParam String joinCode, @RequestAttribute("userId") Long userId) {
        if (joinCode == null) {
            throw new InvalidInputException("Join Code is required");
        }
        Enrollment createdEnrollment = enrollmentService.createEnrollment(userId, joinCode);
        return new ResponseEntity<>(createdEnrollment, HttpStatus.CREATED);
    }



    @GetMapping
    public ResponseEntity<List<Enrollment>> getAllEnrollments() {
        List<Enrollment> enrollments = enrollmentService.getAllEnrollments();
        return ResponseEntity.ok(enrollments);
    }

    @GetMapping("/{enrollmentId}")
    public ResponseEntity<Enrollment> getEnrollmentById(@PathVariable Long enrollmentId) {
        return new ResponseEntity<>(enrollmentService.getEnrollmentById(enrollmentId), HttpStatus.OK);
    }

    @GetMapping("/students/{studentId}")
    public ResponseEntity<List<Enrollment>> getEnrollmentsByStudent(@PathVariable Long studentId) {
        List<Enrollment> enrollments = enrollmentService.getEnrollmentsByStudentId(studentId);
        return ResponseEntity.ok(enrollments);
    }

    @GetMapping("/courses/{courseId}")
    public ResponseEntity<List<Enrollment>> getEnrollmentsByCourse(@PathVariable Long courseId) {
        List<Enrollment> enrollments = enrollmentService.getEnrollmentsByCourseId(courseId);
        return ResponseEntity.ok(enrollments);
    }

    @PutMapping("/{enrollmentId}")
    public ResponseEntity<Enrollment> updateEnrollment(
            @PathVariable Long enrollmentId,
            @Valid @RequestBody Enrollment enrollmentDetails) {
        Enrollment updatedEnrollment = enrollmentService.updateEnrollment(enrollmentId, enrollmentDetails);
        return updatedEnrollment != null
                ? ResponseEntity.ok(updatedEnrollment)
                : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{enrollmentId}")
    public ResponseEntity<Void> deleteEnrollment(@PathVariable Long enrollmentId) {
        enrollmentService.deleteEnrollment(enrollmentId);
        return ResponseEntity.noContent().build();
    }
}
