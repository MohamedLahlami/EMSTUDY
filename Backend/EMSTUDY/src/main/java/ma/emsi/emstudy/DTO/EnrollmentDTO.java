package ma.emsi.emstudy.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnrollmentDTO {
    private Long enrollmentId;
    private Long courseId;
    private Long studentId;
    private LocalDate enrollmentDate;
    private LocalDate completionDate;
}
