package ma.emsi.emstudy.Service;

import lombok.RequiredArgsConstructor;
import ma.emsi.emstudy.Entity.*;
import ma.emsi.emstudy.Exception.ResourceNotFoundException;
import ma.emsi.emstudy.Repository.EnrollmentRepo;
import ma.emsi.emstudy.Repository.SubmissionRepo;
import ma.emsi.emstudy.Repository.UserRepo;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SubmissionService {
    
    private final SubmissionRepo submissionRepo;
    private final UserRepo userRepo;
    private final EnrollmentRepo enrollmentRepo;

    public List<Submission> getAllSubmissions() {
        return submissionRepo.findAll();
    }

    public Optional<Submission> getSubmissionById(Long id) {
        return submissionRepo.findById(id);
    }

    public Submission getSubmissionsByQuizAndStudent(Long quizId, Long studentId) {
    return submissionRepo.findByStudentUserId(studentId).stream()
            .filter(submission -> submission.getAnswers().stream()
                    .anyMatch(answer -> answer.getQuestion().getQuiz().getItemId().equals(quizId)))
            .findFirst().orElse(null);
}

    public Submission createSubmission(Student student, List<Answer> answers) {
        if (answers.isEmpty()) {
            throw new IllegalArgumentException("No answers provided.");
        }
        Quiz quiz = answers.get(0).getQuestion().getQuiz();
        if (quiz == null) {
            throw new IllegalArgumentException("Quiz not found for the provided answers.");
        }
        if (student == null) {
            throw new IllegalArgumentException("Student not found.");
        }
        if (enrollmentRepo.findByStudentUserIdAndCourse_CourseId(student.getUserId(), quiz.getCourse().getCourseId()).isEmpty()) {
            throw new IllegalArgumentException("Student is not enrolled in the course.");
        }
        if (answers.stream().anyMatch(answer -> answer.getQuestion().getQuiz() != quiz)) {
            throw new IllegalArgumentException("All answers must belong to the same quiz.");
        }
        Submission submission = new Submission();
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
