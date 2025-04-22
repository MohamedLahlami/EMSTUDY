package ma.emsi.emstudy.Service;

import lombok.RequiredArgsConstructor;
import ma.emsi.emstudy.Entity.Question;
import ma.emsi.emstudy.Repository.QuestionRepo;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class QuestionService {
    
    private final QuestionRepo questionRepo;

    public Question createQuestion(Question question) {
        return questionRepo.save(question);
    }

    public List<Question> getAllQuestions() {
        return questionRepo.findAll();
    }

    public Optional<Question> getQuestionById(Long id) {
        return questionRepo.findById(id);
    }

    public List<Question> getQuestionsByQuizId(Long quizId) {
        return questionRepo.findByQuizItemId(quizId);
    }

    public Question updateQuestion(Long id, Question questionDetails) {
        Question question = questionRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found with id: " + id));
        
        question.setQuestionText(questionDetails.getQuestionText());
        question.setPoints(questionDetails.getPoints());
        question.setQuestionType(questionDetails.getQuestionType());
        question.setExplanation(questionDetails.getExplanation());
        question.setAnswers(questionDetails.getAnswers());
        
        return questionRepo.save(question);
    }

    public void deleteQuestion(Long id) {
        Question question = questionRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found with id: " + id));
        questionRepo.delete(question);
    }
}
