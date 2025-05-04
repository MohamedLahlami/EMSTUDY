package ma.emsi.emstudy.Service;

import lombok.RequiredArgsConstructor;
import ma.emsi.emstudy.Entity.Answer;
import ma.emsi.emstudy.Entity.Question;
import ma.emsi.emstudy.Repository.AnswerRepo;
import ma.emsi.emstudy.Repository.QuestionRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AnswerService {

    private final QuestionRepo questionRepo;
    private final AnswerRepo answerRepo;

    public Answer createAnswer(Answer answer, Long questionId) {
        Question question = questionRepo.findById(questionId).orElseThrow(() -> new IllegalArgumentException("Question not found with id: " + questionId));
        answer.setQuestion(question);
        return answerRepo.save(answer);
    }

    public List<Answer> getAllAnswers() {
        return answerRepo.findAll();
    }

    public Optional<Answer> getAnswerById(Long id) {
        return answerRepo.findById(id);
    }

    public List<Answer> getAnswersByQuestionId(Long questionId) {
        return answerRepo.findByQuestion_QuestionId(questionId);
    }

    public Answer updateAnswer(Long id, Answer answerDetails) {
        Optional<Answer> answer = answerRepo.findById(id);
        if (answer.isPresent()) {
            Answer existingAnswer = answer.get();
            existingAnswer.setAnswerText(answerDetails.getAnswerText());
            existingAnswer.setCorrect(answerDetails.isCorrect());
            existingAnswer.setQuestion(answerDetails.getQuestion());
            return answerRepo.save(existingAnswer);
        }
        return null;
    }

    public void deleteAnswer(Long id) {
        answerRepo.deleteById(id);
    }
}
