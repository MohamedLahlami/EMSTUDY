package ma.emsi.emstudy.Entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@Table(name = "submissions")
@NoArgsConstructor
@AllArgsConstructor
public class Submission {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long submissionId;

    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private boolean submitted;
    private float score;

    @ManyToMany
    private List<Answer> answers = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "quiz_id")
    @JsonBackReference
    private Quiz quiz;

    @ManyToOne
    @JoinColumn(name = "student_id")
    @JsonBackReference(value = "student_submissions")
    private Student student;
}