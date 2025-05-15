package ma.emsi.emstudy.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import ma.emsi.emstudy.Entity.Student;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnrollmentDTO {
    private Long enrollmentId;
    private Long courseId;
    private StudentDTO student;
    private LocalDate enrollmentDate;
    private LocalDate completionDate;
}
