package ma.emsi.emstudy.Service;

import ma.emsi.emstudy.Entity.Course;
import ma.emsi.emstudy.Entity.Student;
import ma.emsi.emstudy.Entity.Teacher;
import ma.emsi.emstudy.Entity.Quiz;

import java.time.LocalDate;
import java.util.ArrayList;

/**
 * Utility class for test data builders and common test methods
 */
public class TestUtils {

    /**
     * Course test data builder
     */
    public static class CourseTestBuilder {
        private Course course = new Course();

        public CourseTestBuilder() {
            course.setCourseItems(new ArrayList<>());
            course.setCompletedCourseItems(new ArrayList<>());
            course.setEnrollments(new ArrayList<>());
        }

        public CourseTestBuilder withId(Long id) {
            course.setCourseId(id);
            return this;
        }

        public CourseTestBuilder withName(String name) {
            course.setName(name);
            return this;
        }

        public CourseTestBuilder withDescription(String description) {
            course.setDescription(description);
            return this;
        }

        public CourseTestBuilder withTeacher(Teacher teacher) {
            course.setTeacher(teacher);
            return this;
        }

        public CourseTestBuilder withCreationDate(LocalDate creationDate) {
            course.setCreationDate(creationDate);
            return this;
        }

        public Course build() {
            return course;
        }
    }

    /**
     * Student test data builder
     */
    public static class StudentTestBuilder {
        private Student student = new Student();

        public StudentTestBuilder() {
            student.setEnrollments(new ArrayList<>());
            student.setCompletedCourseItems(new ArrayList<>());
            student.setSubmissions(new ArrayList<>());
        }

        public StudentTestBuilder withId(Long id) {
            student.setUserId(id);
            return this;
        }

        public StudentTestBuilder withUsername(String username) {
            student.setUsername(username);
            return this;
        }

        public StudentTestBuilder withEmail(String email) {
            student.setEmail(email);
            return this;
        }

        public StudentTestBuilder withPassword(String password) {
            student.setPassword(password);
            return this;
        }

        public StudentTestBuilder withGroup(String group) {
            student.setStudentGroup(group);
            return this;
        }

        public StudentTestBuilder withStatus(String status) {
            student.setStatus(status);
            return this;
        }

        public Student build() {
            return student;
        }
    }

    /**
     * Teacher test data builder
     */
    public static class TeacherTestBuilder {
        private Teacher teacher = new Teacher();

        public TeacherTestBuilder() {
            teacher.setCourses(new ArrayList<>());
        }

        public TeacherTestBuilder withId(Long id) {
            teacher.setUserId(id);
            return this;
        }

        public TeacherTestBuilder withUsername(String username) {
            teacher.setUsername(username);
            return this;
        }

        public TeacherTestBuilder withEmail(String email) {
            teacher.setEmail(email);
            return this;
        }

        public TeacherTestBuilder withPassword(String password) {
            teacher.setPassword(password);
            return this;
        }

        public TeacherTestBuilder withBio(String bio) {
            teacher.setBio(bio);
            return this;
        }

        public Teacher build() {
            return teacher;
        }
    }

    /**
     * Quiz test data builder
     */
    public static class QuizTestBuilder {
        private Quiz quiz = new Quiz();

        public QuizTestBuilder() {
            quiz.setQuestions(new ArrayList<>());
        }

        public QuizTestBuilder withTitle(String title) {
            quiz.setTitle(title);
            return this;
        }

        public QuizTestBuilder withDuration(int minutes) {
            quiz.setDurationInMinutes(minutes);
            return this;
        }

        public QuizTestBuilder withShowCorrectAnswers(boolean showCorrectAnswers) {
            quiz.setShowCorrectAnswers(showCorrectAnswers);
            return this;
        }

        public Quiz build() {
            return quiz;
        }
    }
}