package ma.emsi.emstudy.Repository;

import ma.emsi.emstudy.Entity.Answer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnswerRepo extends JpaRepository<Answer, Long> {
     List<Answer> findByQuestion_QuestionId(Long questionQuestionId);
}