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
    private final CourseItemRepo courseItemRepo;
    private final CourseMaterialRepo courseMaterialRepo;
    private final CourseRepo courseRepo;

    public CourseMaterialService(CourseItemRepo courseItemRepo,
                                 CourseMaterialRepo courseMaterialRepo,
                                 CourseRepo courseRepo) {
        super(courseItemRepo, courseRepo);
        this.courseItemRepo = courseItemRepo;
        this.courseMaterialRepo = courseMaterialRepo;
        this.courseRepo = courseRepo;
    }

    @Override
    protected void updateFields(CourseMaterial existingItem, CourseMaterial updatedItem) {
        super.updateFields(existingItem, updatedItem);
        existingItem.setCourseMaterialType(updatedItem.getCourseMaterialType());
        existingItem.setUrl(updatedItem.getUrl());
        existingItem.setDescription(updatedItem.getDescription());
    }
}
