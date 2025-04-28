package ma.emsi.emstudy.Entity;


import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "enrollments")
@Builder
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long enrollmentId;
    private LocalDate enrollmentDate;
    private LocalDate completionDate;

    @ManyToOne
    @JoinColumn(name = "student_id")
    @JsonBackReference(value = "student_enrollments")
    private Student student;

    @ManyToOne
    @JoinColumn(name = "course_id")
    @JsonBackReference(value = "course_enrollments")
    private Course course;

}
