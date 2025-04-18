package ma.emsi.emstudy.Entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "course_items")
@Inheritance(strategy = InheritanceType.JOINED)
@DiscriminatorColumn(name = "item_type")
@AllArgsConstructor
@NoArgsConstructor
public abstract class CourseItem {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long itemId;
    private String title;
    private boolean isCompleted;
    private LocalDateTime addDate;

    @ManyToOne
    @JoinColumn(name = "course_id")
    @JsonBackReference
    private Course course;
}
