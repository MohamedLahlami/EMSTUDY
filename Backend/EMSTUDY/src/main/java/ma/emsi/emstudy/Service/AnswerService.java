package ma.emsi.emstudy.Service;

import ma.emsi.emstudy.Entity.Answer;
import ma.emsi.emstudy.Repository.AnswerRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AnswerService {

    @Autowired
    private AnswerRepo answerRepo;

    public Answer createAnswer(Answer answer) {
        return answerRepo.save(answer);
    }

    public List<Answer> getAllAnswers() {
        return answerRepo.findAll();
    }

    public Optional<Answer> getAnswerById(Long id) {
        return answerRepo.findById(id);
    }

    public List<Answer> getAnswersByQuestionId(Long questionId) {
        return answerRepo.findByQuestionId(questionId);
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
