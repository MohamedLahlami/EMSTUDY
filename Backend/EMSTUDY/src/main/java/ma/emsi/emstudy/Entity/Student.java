package ma.emsi.emstudy.Entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "students")
@Builder
public class Student extends User {

    private String status;
    private String studentGroup;


    @OneToMany(mappedBy = "student", cascade = CascadeType.PERSIST)
    @JsonManagedReference
    private List<Enrollment> enrollments;
}
