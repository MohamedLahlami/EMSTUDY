package ma.emsi.emstudy.Service;

import ma.emsi.emstudy.Entity.Question;
import ma.emsi.emstudy.Entity.Quiz;
import ma.emsi.emstudy.Exception.ResourceNotFoundException;
import ma.emsi.emstudy.Repository.CourseItemRepo;
import ma.emsi.emstudy.Repository.CourseRepo;
import ma.emsi.emstudy.Repository.QuizRepo;
import org.springframework.stereotype.Service;

@Service
public class QuizService extends CourseItemService<Quiz>{
    private final QuizRepo quizRepo;
    public QuizService(CourseItemRepo courseItemRepo, CourseRepo courseRepo, QuizRepo quizRepo) {
        super(courseItemRepo, courseRepo);
        this.quizRepo = quizRepo;
    }

    public Quiz updateQuiz(Long quizId, Quiz updatedQuiz) {
        Quiz existingQuiz = quizRepo.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id: " + quizId));
        existingQuiz.setQuestions(updatedQuiz.getQuestions());
        existingQuiz.setShowCorrectAnswers(updatedQuiz.isShowCorrectAnswers());
        existingQuiz.setDurationInMinutes(updatedQuiz.getDurationInMinutes());

        existingQuiz.setTitle(updatedQuiz.getTitle());
        return quizRepo.save(existingQuiz);
    }

    public Quiz addQuestion(Long quizId, Question question) {
        Quiz quiz = quizRepo.findById(quizId).orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id: " + quizId));
        question.setQuiz(quiz);
        quiz.getQuestions().add(question);
        return quizRepo.save(quiz);
    }
}
