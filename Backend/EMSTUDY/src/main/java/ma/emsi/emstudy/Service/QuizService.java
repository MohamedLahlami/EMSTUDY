package ma.emsi.emstudy.Service;

import jakarta.validation.constraints.NotNull;
import ma.emsi.emstudy.Entity.Answer;
import ma.emsi.emstudy.Entity.Quiz;
import ma.emsi.emstudy.Exception.ResourceNotFoundException;
import ma.emsi.emstudy.Repository.CourseItemRepo;
import ma.emsi.emstudy.Repository.CompletedCourseItemRepo;
import ma.emsi.emstudy.Repository.CourseRepo;
import ma.emsi.emstudy.Repository.QuizRepo;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class QuizService extends CourseItemService<Quiz>{
    private final QuizRepo quizRepo;
    public QuizService(CourseItemRepo courseItemRepo, CourseRepo courseRepo, QuizRepo quizRepo) {
        super(courseItemRepo, courseRepo);
        this.quizRepo = quizRepo;
    }

    public Quiz createQuiz(Quiz quiz, Long courseId) {
        return addCourseItem(quiz, courseId);
    }


}
