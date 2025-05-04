package ma.emsi.emstudy.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import ma.emsi.emstudy.Entity.Answer;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubmissionDTO {
    private long submissionId;
    private String submissionDate;
    private float score;
    private List<Answer> answers;
}