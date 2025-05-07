package ma.emsi.emstudy.Controller;

import lombok.RequiredArgsConstructor;
import ma.emsi.emstudy.Entity.Quiz;
import ma.emsi.emstudy.Entity.Question;
import ma.emsi.emstudy.Exception.ForbiddenAccessException;
import ma.emsi.emstudy.Service.CourseItemService;
import ma.emsi.emstudy.Service.CourseService;
import ma.emsi.emstudy.Service.QuizService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/quizzes")
@RequiredArgsConstructor
public class QuizController {

    private final CourseService courseService;
    private final CourseItemService<Quiz> courseItemService;
    private final QuizService quizService;


    @PostMapping
    public ResponseEntity<Quiz> createQuiz(
            @RequestBody Quiz quiz,
            @RequestParam Long courseId,
            @RequestAttribute("userId") Long userId
    ) {
        if(!courseService.isTeacherOfCourse(userId, courseId)) {
            throw new ForbiddenAccessException("You are not allowed to create a quiz for this course.");
        }
        quiz.setAddDate(LocalDateTime.now());
        return ResponseEntity.ok(courseItemService.addCourseItem(quiz, courseId));
    }

    @PostMapping("/{quizId}/questions")
    public ResponseEntity<Quiz> addQuestion(
            @PathVariable Long quizId,
            @Valid @RequestBody Question question,
            @RequestAttribute("userId") Long userId
    ) {
        return ResponseEntity.ok(quizService.addQuestion(quizId, question));
    }
}
