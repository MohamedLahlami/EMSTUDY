package ma.emsi.emstudy.Service;

import ma.emsi.emstudy.Entity.Answer;
import ma.emsi.emstudy.Entity.Quiz;
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

    @Override
    protected void updateFields(Quiz existingQuiz, Quiz updatedQuiz) {
        existingQuiz.setTitle(updatedQuiz.getTitle());
        existingQuiz.setDurationInMinutes(updatedQuiz.getDurationInMinutes());
        existingQuiz.setShowCorrectAnswers(updatedQuiz.isShowCorrectAnswers());
        existingQuiz.setQuestions(updatedQuiz.getQuestions());
    }

    // Quiz-specific methods can be added here
    public Quiz submitQuiz(Long quizId, List<Answer> answers) {
        Quiz quiz = getCourseItemById(quizId);
        if (quiz != null) {
            // Add submission logic here
            return courseItemRepo.save(quiz);
        }
        return null;
    }
}
