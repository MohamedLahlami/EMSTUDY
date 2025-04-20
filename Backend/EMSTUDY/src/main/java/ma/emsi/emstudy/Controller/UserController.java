package ma.emsi.emstudy.Controller;

import ma.emsi.emstudy.Entity.Student;
import ma.emsi.emstudy.Entity.Teacher;
import ma.emsi.emstudy.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/addTeacher")
    public ResponseEntity<?> addTeacher(@RequestBody Teacher teacher) {
        if (userService.existsByEmail(teacher.getEmail())) {
            return new ResponseEntity<>("User with this email already exists", HttpStatus.CONFLICT);
        }
        Teacher createdTeacher = (Teacher) userService.createUser(teacher);
        return new ResponseEntity<>(createdTeacher, HttpStatus.CREATED);
    }

    @PostMapping("/addStudent")
    public ResponseEntity<?> addStudent(@RequestBody Student student) {
        if (userService.existsByEmail(student.getEmail())) {
            return new ResponseEntity<>("User with this email already exists", HttpStatus.CONFLICT);
        }
        Student createdStudent = (Student) userService.createUser(student);
        return new ResponseEntity<>(createdStudent, HttpStatus.CREATED);
    }
}
