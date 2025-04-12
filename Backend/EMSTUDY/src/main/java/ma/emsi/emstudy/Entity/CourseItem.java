package ma.emsi.emstudy.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@Inheritance(strategy = InheritanceType.JOINED)
@AllArgsConstructor
@NoArgsConstructor
public abstract class CourseItem {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long itemId;

    @ManyToOne
    @JoinColumn(name = "course_id")
    private Course course;

    private boolean isCompleted;
    private LocalDateTime addDate;
}
