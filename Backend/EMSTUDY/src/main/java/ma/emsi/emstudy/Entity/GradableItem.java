package ma.emsi.emstudy.Entity;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Inheritance(strategy = InheritanceType.JOINED)
@DiscriminatorColumn(name = "gradable_item_type")
@Table(name = "gradable_items")
public abstract class GradableItem extends CourseItem{


    @OneToOne(mappedBy = "gradableItem")
    private Submission submission;

    private Integer maxScore;
    private LocalDateTime dueDate;

}
