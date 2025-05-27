package ma.emsi.emstudy.Controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import ma.emsi.emstudy.DTO.EnrollmentDTO;
import ma.emsi.emstudy.DTO.StudentDTO;
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
@Tag(name = "Enrollments", description = "APIs for managing course enrollments")
@SecurityRequirement(name = "bearerAuth")
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    @Operation(
            summary = "Create new enrollment",
            description = "Enroll a student in a course using a join code",
            responses = {
                    @ApiResponse(responseCode = "201", description = "Enrollment created successfully"),
                    @ApiResponse(responseCode = "400", description = "Invalid join code"),
                    @ApiResponse(responseCode = "404", description = "Course not found")
            }
    )
    @GetMapping("/enroll")
    public ResponseEntity<Enrollment> createEnrollment(
            @Parameter(description = "Course join code") @RequestParam String joinCode,
            @RequestAttribute("userId") Long userId) {
        if (joinCode == null) {
            throw new InvalidInputException("Join Code is required");
        }
        Enrollment createdEnrollment = enrollmentService.createEnrollment(userId, joinCode);
        return new ResponseEntity<>(createdEnrollment, HttpStatus.CREATED);
    }

    @Operation(
            summary = "Get all enrollments",
            description = "Retrieve all enrollments in the system",
            responses = {
                    @ApiResponse(responseCode = "200", description = "List of enrollments retrieved successfully")
            }
    )
    @GetMapping
    public ResponseEntity<List<EnrollmentDTO>> getAllEnrollments() {
        List<Enrollment> enrollments = enrollmentService.getAllEnrollments();
        return toEnrollmentDTO(enrollments);
    }

    private ResponseEntity<List<EnrollmentDTO>> toEnrollmentDTO(List<Enrollment> enrollments) {
        List<EnrollmentDTO> enrollmentDTOs = enrollments.stream()
                .map(enrollment -> EnrollmentDTO.builder()
                        .enrollmentId(enrollment.getEnrollmentId())
                        .student(StudentDTO.builder()
                                .id(enrollment.getStudent().getUserId())
                                .username(enrollment.getStudent().getUsername())
                                .email(enrollment.getStudent().getEmail())
                                .build())
                        .courseId(enrollment.getCourse().getCourseId())
                        .enrollmentDate(enrollment.getEnrollmentDate())
                        .completionDate(enrollment.getCompletionDate())
                        .build())
                .toList();
        return ResponseEntity.ok(enrollmentDTOs);
    }

    @Operation(
            summary = "Get enrollment by ID",
            description = "Retrieve a specific enrollment by its ID",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Enrollment found and returned"),
                    @ApiResponse(responseCode = "404", description = "Enrollment not found")
            }
    )
    @GetMapping("/{enrollmentId}")
    public ResponseEntity<EnrollmentDTO> getEnrollmentById(
            @Parameter(description = "ID of the enrollment") @PathVariable Long enrollmentId) {
        Enrollment enrollment = enrollmentService.getEnrollmentById(enrollmentId);
        EnrollmentDTO enrollmentDTO = EnrollmentDTO.builder()
                .enrollmentId(enrollment.getEnrollmentId())
                .student(StudentDTO.builder()
                        .id(enrollment.getStudent().getUserId())
                        .username(enrollment.getStudent().getUsername())
                        .email(enrollment.getStudent().getEmail())
                        .build())
                .courseId(enrollment.getCourse().getCourseId())
                .enrollmentDate(enrollment.getEnrollmentDate())
                .completionDate(enrollment.getCompletionDate())
                .build();
        return new ResponseEntity<>(enrollmentDTO, HttpStatus.OK);
    }

    @Operation(
            summary = "Get enrollments by student",
            description = "Retrieve all enrollments for a specific student",
            responses = {
                    @ApiResponse(responseCode = "200", description = "List of enrollments retrieved successfully"),
                    @ApiResponse(responseCode = "404", description = "Student not found")
            }
    )
    @GetMapping("/students/{studentId}")
    public ResponseEntity<List<EnrollmentDTO>> getEnrollmentsByStudent(
            @Parameter(description = "ID of the student") @PathVariable Long studentId) {
        List<Enrollment> enrollments = enrollmentService.getEnrollmentsByStudentId(studentId);
        return toEnrollmentDTO(enrollments);
    }

    @Operation(
            summary = "Get enrollments by course",
            description = "Retrieve all enrollments for a specific course",
            responses = {
                    @ApiResponse(responseCode = "200", description = "List of enrollments retrieved successfully"),
                    @ApiResponse(responseCode = "404", description = "Course not found")
            }
    )
    @GetMapping("/courses/{courseId}")
    public ResponseEntity<List<EnrollmentDTO>> getEnrollmentsByCourse(
            @Parameter(description = "ID of the course") @PathVariable Long courseId) {
        List<Enrollment> enrollments = enrollmentService.getEnrollmentsByCourseId(courseId);
        return toEnrollmentDTO(enrollments);
    }

    @Operation(
            summary = "Update enrollment",
            description = "Update an existing enrollment",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Enrollment updated successfully"),
                    @ApiResponse(responseCode = "404", description = "Enrollment not found"),
                    @ApiResponse(responseCode = "400", description = "Invalid input")
            }
    )
    @PutMapping("/{enrollmentId}")
    public ResponseEntity<Enrollment> updateEnrollment(
            @Parameter(description = "ID of the enrollment") @PathVariable Long enrollmentId,
            @Parameter(description = "Updated enrollment details") @RequestBody Enrollment enrollmentDetails) {
        Enrollment updatedEnrollment = enrollmentService.updateEnrollment(enrollmentId, enrollmentDetails);
        return updatedEnrollment != null
                ? ResponseEntity.ok(updatedEnrollment)
                : ResponseEntity.notFound().build();
    }

    @Operation(
            summary = "Delete enrollment",
            description = "Delete a specific enrollment",
            responses = {
                    @ApiResponse(responseCode = "204", description = "Enrollment deleted successfully"),
                    @ApiResponse(responseCode = "404", description = "Enrollment not found")
            }
    )
    @DeleteMapping("/{enrollmentId}")
    public ResponseEntity<Void> deleteEnrollment(
            @Parameter(description = "ID of the enrollment") @PathVariable Long enrollmentId) {
        enrollmentService.deleteEnrollment(enrollmentId);
        return ResponseEntity.noContent().build();
    }
}
