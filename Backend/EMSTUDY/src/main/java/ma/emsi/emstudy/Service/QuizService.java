package ma.emsi.emstudy.Service;

import jakarta.validation.constraints.NotNull;
import ma.emsi.emstudy.Entity.Answer;
import ma.emsi.emstudy.Entity.Quiz;
import ma.emsi.emstudy.Exception.ResourceNotFoundException;
import ma.emsi.emstudy.Repository.CourseItemRepo;
import ma.emsi.emstudy.Repository.CompletedCourseItemRepo;
import ma.emsi.emstudy.Repository.QuizRepo;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class QuizService extends CourseItemService<Quiz> {
    private final QuizRepo quizRepo;

    public QuizService(CourseItemRepo courseItemRepo, 
                      CompletedCourseItemRepo completedCourseItemRepo,
                      QuizRepo quizRepo) {
        super(courseItemRepo, completedCourseItemRepo);
        this.quizRepo = quizRepo;
    }

    public Quiz getQuizById(@NotNull(message = "Quiz ID is required") Long quizId) {
        return quizRepo.findById(Math.toIntExact(quizId))
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id: " + quizId));
    }

    @Override
    protected void updateFields(Quiz existingQuiz, Quiz updatedQuiz) {
        super.updateFields(existingQuiz, updatedQuiz);
        existingQuiz.setDurationInMinutes(updatedQuiz.getDurationInMinutes());
        existingQuiz.setShowCorrectAnswers(updatedQuiz.isShowCorrectAnswers());
        existingQuiz.setQuestions(updatedQuiz.getQuestions());
    }

    public Quiz submitQuiz(Long quizId, List<Answer> answers) {
        Quiz quiz = getCourseItemById(quizId);
        if (quiz != null) {
            // Add submission logic here
            return courseItemRepo.save(quiz);
        }
        return null;
    }
}
