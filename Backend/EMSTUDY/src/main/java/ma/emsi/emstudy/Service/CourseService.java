package ma.emsi.emstudy.Service;

import lombok.RequiredArgsConstructor;
import ma.emsi.emstudy.Entity.Course;
import ma.emsi.emstudy.Entity.CourseItem;
import ma.emsi.emstudy.Repository.CourseRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseService {
    private final CourseRepo courseRepo;

    public Course addCourse(Course course) {
        if (course.getCourseItems() != null) {
            for (CourseItem item : course.getCourseItems()) {
                item.setCourse(course);
            }
        }
        return courseRepo.save(course);
    }

    public List<Course> getAllCourses() {
        return courseRepo.findAll();
    }

    public Course getCourseById(Long id) {
        return courseRepo.findById(id).orElse(null);
    }

    public void deleteCourse(Long id) {
        courseRepo.deleteById(id);
    }

    public Course updateCourse(Course course) {
        Course existingCourse = courseRepo.findById(course.getCourseId()).orElse(null);
        if (existingCourse != null) {
            existingCourse.setName(course.getName());
            existingCourse.setDescription(course.getDescription());
            existingCourse.setCourseItems(course.getCourseItems());
            return courseRepo.save(existingCourse);
        }
        return null;
    }

    public boolean isTeacherOfCourse(Long teacherId, Long courseId) {
        return courseRepo.existsByTeacherUserIdAndCourseId(teacherId, courseId);
    }
}
