package ma.emsi.emstudy.Repository;

import ma.emsi.emstudy.Entity.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubmissionRepo extends JpaRepository<Submission, Long> {
    List<Submission> findByQuiz_ItemIdAndStudent_UserId(Long quizId, Long studentUserId);
}
