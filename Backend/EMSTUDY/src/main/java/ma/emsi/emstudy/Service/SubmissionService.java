package ma.emsi.emstudy.Service;

import lombok.RequiredArgsConstructor;
import ma.emsi.emstudy.Entity.*;
import ma.emsi.emstudy.Exception.QuizTimeExceededException;
import ma.emsi.emstudy.Exception.ResourceNotFoundException;
import ma.emsi.emstudy.Repository.EnrollmentRepo;
import ma.emsi.emstudy.Repository.QuizRepo;
import ma.emsi.emstudy.Repository.SubmissionRepo;
import ma.emsi.emstudy.Repository.UserRepo;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    private final QuizRepo quizRepo;

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

    @Transactional
    public Submission startSubmission(Student student, Long quizId) {
        if (student == null) {
            throw new IllegalArgumentException("Student not found.");
        }
        Quiz quiz = quizRepo.findById(quizId) .orElseThrow(() -> new ResourceNotFoundException("Quiz not found."));
        if (enrollmentRepo.findByStudentUserIdAndCourse_CourseId(student.getUserId(), quiz.getCourse().getCourseId()).isEmpty()) {
            throw new IllegalArgumentException("Student is not enrolled in the course.");
        }
        Submission submission = new Submission();
        submission.setStudent(student);
        submission.setAnswers(List.of());
        submission.setQuiz(quiz);
        submission.setStartTime(LocalDateTime.now());
        submission.setEndTime(LocalDateTime.now().plusMinutes(quiz.getDurationInMinutes()));
        submission.setScore(0);
        return submissionRepo.save(submission);
    }

    @Transactional
    public Submission submitSubmission(Long submissionId, List<Answer> answers) {
        Submission submission = submissionRepo.findById(submissionId).orElseThrow(() -> new ResourceNotFoundException("Submission not found."));
        if (submission.isSubmitted()){
            throw new IllegalArgumentException("Submission has already been submitted.");
        }
        if (LocalDateTime.now().isAfter(submission.getEndTime())) {
            throw new QuizTimeExceededException("Quiz time has expired.");
        }
        if (answers.isEmpty()) {
            throw new IllegalArgumentException("No answers provided.");
        }
        if (answers.stream().anyMatch(answer -> !answer.getQuestion().getQuiz().getItemId().equals(submission.getQuiz().getItemId()) )) {
            throw new IllegalArgumentException("All answers must belong to the same quiz.");
        }
        submission.setAnswers(answers);
        submission.setSubmitted(true);
        float score = calculateScore(answers, submission.getQuiz());
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
