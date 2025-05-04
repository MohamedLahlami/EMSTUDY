package ma.emsi.emstudy.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.boot.autoconfigure.web.WebProperties;

@Entity
@Data
@Table(name = "course_materials")
@DiscriminatorValue("CM")
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CourseMaterial extends CourseItem{

    @Enumerated(EnumType.STRING)
    private CourseMaterialType courseMaterialType;

    private String url;

    private String description;

}
