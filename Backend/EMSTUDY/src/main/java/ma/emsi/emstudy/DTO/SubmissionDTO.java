package ma.emsi.emstudy.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import ma.emsi.emstudy.Entity.Answer;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubmissionDTO {
    private Long submissionId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private boolean submitted;
    private double score;
    private Long studentId;
    private Long quizId;
    private List<Answer> answers;
    private String username;
}
