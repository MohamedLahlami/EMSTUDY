package ma.emsi.emstudy.Service;

import lombok.RequiredArgsConstructor;
import ma.emsi.emstudy.Entity.*;
import ma.emsi.emstudy.Exception.QuizTimeExceededException;
import ma.emsi.emstudy.Exception.ResourceNotFoundException;
import ma.emsi.emstudy.Repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SubmissionService {
    
    private final SubmissionRepo submissionRepo;
    private final AnswerRepo answerRepo;
    private final EnrollmentRepo enrollmentRepo;
    private final QuizRepo quizRepo;

    public List<Submission> getAllSubmissions() {
        return submissionRepo.findAll();
    }

    public Optional<Submission> getSubmissionById(Long id) {
        return submissionRepo.findById(id);
    }

    public Submission getSubmissionByQuizAndStudent(Long studentId, Long quizId) {
        return submissionRepo.findByStudentUserIdAndQuizItemId(studentId, quizId).orElseThrow(() -> new ResourceNotFoundException("Submission not found."));
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
        if (submissionRepo.findByStudentUserId(student.getUserId()).stream()
                .anyMatch(submission -> submission.getQuiz().getItemId().equals(quizId) && !submission.isSubmitted())) {
            throw new IllegalArgumentException("Student has already started the quiz.");
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
    public Submission submitSubmission(Long submissionId, List<Long> answerIds) {
        Submission submission = submissionRepo.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found."));
        if (submission.isSubmitted()) {
            throw new IllegalArgumentException("Submission has already been submitted.");
        }
        if (LocalDateTime.now().isAfter(submission.getEndTime())) {
            throw new QuizTimeExceededException("Quiz time has expired.");
        }
        if (answerIds.isEmpty()) {
            throw new IllegalArgumentException("No answers provided.");
        }

        List<Answer> answers = answerRepo.findAllById(answerIds);
        if (answers.size() != answerIds.size()) {
            throw new ResourceNotFoundException("One or more answers not found.");
        }

        // Validate that all answers belong to questions in the same quiz
        if (answers.stream()
                .anyMatch(answer -> !answer.getQuestion().getQuiz().getItemId()
                        .equals(submission.getQuiz().getItemId()))) {
            throw new IllegalArgumentException("All answers must belong to the same quiz.");
        }

        submission.setAnswers(answers);
        submission.setSubmitted(true);
        double score = calculateScore(answers, submission.getQuiz());
        submission.setScore(score);
        return submissionRepo.save(submission);
    }

    public void deleteSubmission(Long id) {
        submissionRepo.deleteById(id);
    }

    private double calculateScore(List<Answer> studentAnswers, Quiz quiz) {
        double totalPoints = quiz.getQuestions().stream().mapToInt(Question::getPoints).sum();
        double studentPoints = studentAnswers.stream()
                .filter(Answer::isCorrect)
                .map(answer -> answer.getQuestion().getQuestionType().toString().equals("MULTI_SELECT") ? (1D / answer.getQuestion().getAnswers().stream().filter(Answer::isCorrect).count())*answer.getQuestion().getPoints() : answer.getQuestion().getPoints())
                .mapToDouble(Double::valueOf)
                .sum();

        return (studentPoints / totalPoints) * 100;
    }

    public List<Submission> getSubmissionsByStudent(Long userId) {
        return submissionRepo.findByStudentUserId(userId);
    }

    public List<Submission> getSubmissionsByQuiz(Long quizId) {
        return submissionRepo.findByQuizItemId(quizId);
    }
}
