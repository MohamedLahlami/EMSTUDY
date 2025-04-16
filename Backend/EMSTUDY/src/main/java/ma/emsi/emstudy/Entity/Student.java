package ma.emsi.emstudy.Entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "students")
public class Student extends User {

    private String status;
    private String student_group;


    @OneToMany(mappedBy = "student", cascade = CascadeType.PERSIST)
    @JsonManagedReference
    private List<Enrollment> enrollments;
}
