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
    public ResponseEntity<Teacher> addTeacher(@RequestBody Teacher teacher) {
        Teacher createdTeacher = (Teacher) userService.createUser(teacher);
        return new ResponseEntity<>(createdTeacher, HttpStatus.CREATED);
    }

    @PostMapping("/addStudent")
    public ResponseEntity<Student> addStudent(@RequestBody Student student) {
        Student createdStudent = (Student) userService.createUser(student);
        return new ResponseEntity<>(createdStudent, HttpStatus.CREATED);
    }
}