package ma.emsi.emstudy.Controller;

import lombok.RequiredArgsConstructor;
import ma.emsi.emstudy.Entity.Course;
import ma.emsi.emstudy.Entity.Teacher;
import ma.emsi.emstudy.Service.CourseService;
import ma.emsi.emstudy.Service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/course")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;
    private final UserService userService;

    @PostMapping("/add")
    public ResponseEntity<?> addCourse(@RequestBody Course course, @RequestAttribute("userId") Long userId) {
        if (userId == null) {
            return new ResponseEntity<>("User not authenticated", HttpStatus.UNAUTHORIZED);
        }
        return userService.findById(userId).map(user -> {
            if (user.getRole().equals("Teacher")) {
                Teacher teacher = (Teacher) user;
                course.setTeacher(teacher);
                Course createdCourse = courseService.addCourse(course);
                return new ResponseEntity<>(createdCourse, HttpStatus.CREATED);
            } else {
                return new ResponseEntity<>("Only teachers can create courses", HttpStatus.FORBIDDEN);
            }
        }).orElse(new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND));
    }

    @GetMapping("/all")
    public ResponseEntity<List<Course>> getAllCourses() {
        List<Course> courses = courseService.getAllCourses();
        return new ResponseEntity<>(courses, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Course> getCourseById(@PathVariable Long id) {
        Course course = courseService.getCourseById(id);
        if (course != null) {
            return new ResponseEntity<>(course, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
