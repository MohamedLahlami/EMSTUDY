package ma.emsi.emstudy.Entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "teachers")
public class Teacher extends User {

    private String bio;

    @OneToMany(mappedBy = "teacher", cascade = CascadeType.REMOVE)
    @JsonManagedReference
    private List<Course> courses;
}
