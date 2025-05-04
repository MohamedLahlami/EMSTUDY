package ma.emsi.emstudy.Service;

import lombok.RequiredArgsConstructor;
import ma.emsi.emstudy.Entity.CourseMaterial;
import ma.emsi.emstudy.Repository.CourseItemRepo;
import ma.emsi.emstudy.Repository.CompletedCourseItemRepo;
import ma.emsi.emstudy.Repository.CourseMaterialRepo;
import ma.emsi.emstudy.Repository.CourseRepo;
import org.springframework.stereotype.Service;

@Service
public class CourseMaterialService extends CourseItemService<CourseMaterial> {
    private final CourseMaterialRepo courseMaterialRepo;
    public CourseMaterialService(CourseItemRepo courseItemRepo, CourseRepo courseRepo, CourseMaterialRepo courseMaterialRepo) {
        super(courseItemRepo, courseRepo);
        this.courseMaterialRepo = courseMaterialRepo;
    }
}