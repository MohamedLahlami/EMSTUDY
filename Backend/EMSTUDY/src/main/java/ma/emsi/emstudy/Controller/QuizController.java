package ma.emsi.emstudy.Controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import ma.emsi.emstudy.Entity.Quiz;
import ma.emsi.emstudy.Entity.Question;
import ma.emsi.emstudy.Exception.ForbiddenAccessException;
import ma.emsi.emstudy.Service.CourseItemService;
import ma.emsi.emstudy.Service.CourseService;
import ma.emsi.emstudy.Service.QuizService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/quizzes")
@RequiredArgsConstructor
@Tag(name = "Quizzes", description = "APIs for managing quizzes")
@SecurityRequirement(name = "bearerAuth")
public class QuizController {

    private final CourseService courseService;
    private final CourseItemService<Quiz> courseItemService;
    private final QuizService quizService;


    @Operation(
        summary = "Create new quiz",
        description = "Create a new quiz for a specific course. Only accessible by course teachers.",
        responses = {
            @ApiResponse(responseCode = "200", description = "Quiz created successfully"),
            @ApiResponse(responseCode = "403", description = "User is not the course teacher"),
            @ApiResponse(responseCode = "404", description = "Course not found")
        }
    )
    @PostMapping
    public ResponseEntity<Quiz> createQuiz(
            @Parameter(description = "Quiz details") @RequestBody Quiz quiz,
            @Parameter(description = "ID of the course") @RequestParam Long courseId,
            @RequestAttribute("userId") Long userId
    ) {
        if(!courseService.isTeacherOfCourse(userId, courseId)) {
            throw new ForbiddenAccessException("You are not allowed to create a quiz for this course.");
        }
        quiz.setAddDate(LocalDateTime.now());
        return ResponseEntity.ok(courseItemService.addCourseItem(quiz, courseId));
    }

    @Operation(
        summary = "Add question to quiz",
        description = "Add a new question to an existing quiz",
        responses = {
            @ApiResponse(responseCode = "200", description = "Question added successfully"),
            @ApiResponse(responseCode = "404", description = "Quiz not found"),
            @ApiResponse(responseCode = "400", description = "Invalid question data")
        }
    )
    @PostMapping("/{quizId}/questions")
    public ResponseEntity<Quiz> addQuestion(
            @Parameter(description = "ID of the quiz") @PathVariable Long quizId,
            @Parameter(description = "Question details") @RequestBody Question question,
            @RequestAttribute("userId") Long userId
    ) {
        return ResponseEntity.ok(quizService.addQuestion(quizId, question));
    }
}
