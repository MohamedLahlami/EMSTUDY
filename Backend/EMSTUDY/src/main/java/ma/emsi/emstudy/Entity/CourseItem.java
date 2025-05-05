package ma.emsi.emstudy.Entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@Table(name = "course_items")
@Inheritance(strategy = InheritanceType.JOINED)
@DiscriminatorColumn(name = "itemType")
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.EXISTING_PROPERTY, property = "itemType")
@JsonSubTypes({
        @JsonSubTypes.Type(value = Quiz.class, name = "Q"),
        @JsonSubTypes.Type(value = CourseMaterial.class, name = "CM")
})
@AllArgsConstructor
@NoArgsConstructor
public abstract class CourseItem {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long itemId;
    private String title;
    private LocalDateTime addDate;

    @Column(insertable = false, updatable = false)
    private String itemType;

    //TODO: comment this baraka mn tkhrbi9
//    @OneToMany(mappedBy = "courseItem", cascade = CascadeType.ALL)
//    @JsonManagedReference
//    private List<CompletedCourseItem> completedCourseItems = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "course_id")
    @JsonBackReference(value = "course_courseItems")
    private Course course;
}
