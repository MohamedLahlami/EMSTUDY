package ma.emsi.emstudy.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.boot.autoconfigure.web.WebProperties;

@Entity
@Data
@Table(name = "course_materials")
@AllArgsConstructor
@NoArgsConstructor
public class CourseMaterial extends CourseItem{

    private String type;

    private String url;

    private String description;

}
