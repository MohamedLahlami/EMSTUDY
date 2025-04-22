package ma.emsi.emstudy.Service;

import lombok.RequiredArgsConstructor;
import ma.emsi.emstudy.Entity.*;
import ma.emsi.emstudy.Repository.SubmissionRepo;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SubmissionService {
    
    private final SubmissionRepo submissionRepo;

    public List<Submission> getAllSubmissions() {
        return submissionRepo.findAll();
    }

    public Optional<Submission> getSubmissionById(Long id) {
        return submissionRepo.findById(id);
    }

    public List<Submission> getSubmissionsByQuizAndStudent(Long quizId, Long studentId) {
        return submissionRepo.findByQuizIdAndStudentUserId(quizId, studentId);
    }

    public Submission createSubmission(Quiz quiz, Student student, List<Answer> answers) {
        Submission submission = new Submission();
        submission.setQuiz(quiz);
        submission.setStudent(student);
        submission.setAnswers(answers);
        submission.setSubmissionDate(LocalDateTime.now());
        
        float score = calculateScore(answers, quiz);
        submission.setScore(score);
        
        return submissionRepo.save(submission);
    }

    public void deleteSubmission(Long id) {
        submissionRepo.deleteById(id);
    }

    private float calculateScore(List<Answer> studentAnswers, Quiz quiz) {
        float totalPoints = quiz.getQuestions().stream().mapToInt(Question::getPoints).sum();

        float studentPoints = studentAnswers.stream()
                .filter(Answer::isCorrect)
                .map(answer -> answer.getQuestion().getPoints())
                .mapToInt(Integer::intValue)
                .sum();

        return (studentPoints / totalPoints) * 100;
    }
}
