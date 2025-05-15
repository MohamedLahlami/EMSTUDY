package ma.emsi.emstudy.Entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@Table(name = "courses")
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long courseId;

    private String joinCode;
    private String Name;
    private String Description;
    private LocalDate creationDate;

    @ManyToOne
    @JoinColumn(name = "teacher_id")
    @JsonBackReference(value = "teacher_courses")
    private Teacher teacher;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL)
    @JsonManagedReference(value = "course_courseItems")
    private List<CourseItem> courseItems = new ArrayList<>();

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL)
    @JsonManagedReference(value = "course_completedCourseItems")
    private List<CompletedCourseItem> completedCourseItems = new ArrayList<>();

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL)
    @JsonManagedReference(value = "course_enrollments")
    private List<Enrollment> enrollments = new ArrayList<>();

    @PrePersist
    protected void generateJoinCode() {
        if (this.joinCode == null) {
            StringBuilder code = new StringBuilder();
            for (int i = 0; i < 8; i++) {
                code.append((char) ('A' + (int) (Math.random() * 26)));
            }
            this.joinCode = code.toString();
        }
    }
}
