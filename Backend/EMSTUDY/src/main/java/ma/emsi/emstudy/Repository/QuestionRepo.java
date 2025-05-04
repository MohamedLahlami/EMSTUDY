package ma.emsi.emstudy.Repository;

import ma.emsi.emstudy.Entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepo extends JpaRepository<Question, Long> {
    List<Question> findByQuizItemId(Long quizId);
}
