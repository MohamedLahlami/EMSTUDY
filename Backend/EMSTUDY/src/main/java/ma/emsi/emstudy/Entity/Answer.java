package ma.emsi.emstudy.Entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "answers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Answer {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long answerId;

    private String answerText;
    private boolean Correct;

    @ManyToOne
    @JoinColumn(name = "question_id")
    @JsonBackReference
    private Question question;
}
