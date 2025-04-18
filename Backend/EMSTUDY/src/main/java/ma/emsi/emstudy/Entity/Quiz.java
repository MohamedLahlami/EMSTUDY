package ma.emsi.emstudy.Entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Data
@Table(name = "quizzes")
public class Quiz extends GradableItem{

    private int durationInMinutes;
    private boolean showCorrectAnswers;

    @OneToMany(mappedBy = "quiz", cascade = CascadeType.REMOVE)
    @JsonManagedReference
    private List<Question> questions;
}
