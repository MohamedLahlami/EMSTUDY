package ma.emsi.emstudy.Repository;

import ma.emsi.emstudy.Entity.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubmissionRepo extends JpaRepository<Submission, Long> {
    Optional<Submission> findByStudentUserId(Long studentUserId);
}
