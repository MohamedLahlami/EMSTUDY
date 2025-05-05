package ma.emsi.emstudy.Entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "completed_course_items")
@Builder
public class CompletedCourseItem {

    @Id
    @GeneratedValue
    private Long completedCourseItemId;

    @ManyToOne
    @JoinColumn(name = "student_id")
    @JsonBackReference(value = "student_completedCourseItems")
    private Student student;

    @ManyToOne
    @JoinColumn(name = "course_id")
    @JsonBackReference(value = "course_completedCourseItems")
    private Course course;

    @ManyToOne
    @JoinColumn(name = "course_item_id")
    //@JsonBackReference
    private CourseItem courseItem;

    private LocalDate completedAt; // optional
}
