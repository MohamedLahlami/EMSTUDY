package ma.emsi.emstudy.Controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import ma.emsi.emstudy.Entity.Course;
import ma.emsi.emstudy.Entity.Teacher;
import ma.emsi.emstudy.Exception.ForbiddenAccessException;
import ma.emsi.emstudy.Service.CourseService;
import ma.emsi.emstudy.Service.TeacherService;
import ma.emsi.emstudy.Service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/courses")
@RequiredArgsConstructor
@Tag(name = "Course Management", description = "APIs for managing courses")
@SecurityRequirement(name = "bearerAuth")
public class CourseController {

    private final CourseService courseService;
    private final UserService userService;
    private final TeacherService teacherService;

    @Operation(
        summary = "Create a new course",
        description = "Creates a new course. Only accessible by teachers.",
        responses = {
            @ApiResponse(responseCode = "201", description = "Course created successfully"),
            @ApiResponse(responseCode = "401", description = "User not authenticated"),
            @ApiResponse(responseCode = "403", description = "User is not a teacher"),
            @ApiResponse(responseCode = "404", description = "User not found")
        }
    )
    @PostMapping
    public ResponseEntity<?> addCourse(
        @Parameter(description = "Course details") @RequestBody Course course,
        @RequestAttribute("userId") Long userId) {
        if (userId == null) {
            return new ResponseEntity<>("User not authenticated", HttpStatus.UNAUTHORIZED);
        }
        return userService.findById(userId).map(user -> {
            if (user.getRole().equals("Teacher")) {
                Teacher teacher = (Teacher) user;
                course.setTeacher(teacher);
                return new ResponseEntity<>(courseService.addCourse(course), HttpStatus.CREATED);
            } else {
                return new ResponseEntity<>("Only teachers can create courses", HttpStatus.FORBIDDEN);
            }
        }).orElse(new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND));
    }

    @Operation(
        summary = "Get all courses",
        description = "Retrieves all courses. Only accessible by teachers.",
        responses = {
            @ApiResponse(responseCode = "200", description = "List of courses retrieved successfully"),
            @ApiResponse(responseCode = "403", description = "User is not authorized")
        }
    )
    @GetMapping
    public ResponseEntity<List<Course>> getAllCourses(@RequestAttribute("userId") Long userId) {
        if (teacherService.getTeacher(userId) == null) {
            throw new ForbiddenAccessException("You are not authorized to view this page");
        }
        List<Course> courses = courseService.getAllCourses();
        return new ResponseEntity<>(courses, HttpStatus.OK);
    }

    @Operation(
        summary = "Get course by ID",
        description = "Retrieves a specific course by its ID. Only accessible by the course's teacher.",
        responses = {
            @ApiResponse(responseCode = "200", description = "Course found and returned"),
            @ApiResponse(responseCode = "403", description = "User is not authorized"),
            @ApiResponse(responseCode = "404", description = "Course not found")
        }
    )
    @GetMapping("/{courseId}")
    public ResponseEntity<Course> getCourseById(
        @Parameter(description = "ID of the course to retrieve") @PathVariable Long courseId,
        @RequestAttribute("userId") Long userId) {
        if (!courseService.isTeacherOfCourse(userId, courseId)) {
            throw new ForbiddenAccessException("You are not authorized to view this course");
        }
        Course course = courseService.getCourseById(courseId);
        if (course != null) {
            return new ResponseEntity<>(course, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @Operation(
        summary = "Delete course",
        description = "Deletes a specific course. Only accessible by the course's teacher.",
        responses = {
            @ApiResponse(responseCode = "204", description = "Course deleted successfully"),
            @ApiResponse(responseCode = "403", description = "User is not authorized"),
            @ApiResponse(responseCode = "404", description = "Course not found")
        }
    )
    @DeleteMapping("/{courseId}")
    public ResponseEntity<Void> deleteCourse(
        @Parameter(description = "ID of the course to delete") @PathVariable Long courseId,
        @RequestAttribute("userId") Long userId) {
        if (!courseService.isTeacherOfCourse(userId, courseId)) {
            throw new ForbiddenAccessException("You are not authorized to delete this course");
        }
        courseService.deleteCourse(courseId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @Operation(
        summary = "Update course",
        description = "Updates an existing course. Only accessible by the course's teacher.",
        responses = {
            @ApiResponse(responseCode = "200", description = "Course updated successfully"),
            @ApiResponse(responseCode = "403", description = "User is not authorized"),
            @ApiResponse(responseCode = "404", description = "Course not found")
        }
    )
    @PutMapping
    public ResponseEntity<Course> updateCourse(
        @Parameter(description = "Updated course details") @RequestBody Course course,
        @RequestAttribute("userId") Long userId) {
        if (courseService.isTeacherOfCourse(userId, course.getCourseId())) {
            throw new ForbiddenAccessException("You are not authorized to update this course");
        }
        Course updatedCourse = courseService.updateCourse(course);
        if (updatedCourse != null) {
            return new ResponseEntity<>(updatedCourse, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}
