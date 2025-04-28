package ma.emsi.emstudy.Service;

import lombok.RequiredArgsConstructor;
import ma.emsi.emstudy.Entity.CourseMaterial;
import ma.emsi.emstudy.Repository.CourseItemRepo;
import ma.emsi.emstudy.Repository.CompletedCourseItemRepo;
import ma.emsi.emstudy.Repository.CourseMaterialRepo;
import org.springframework.stereotype.Service;

@Service
public class CourseMaterialService extends CourseItemService<CourseMaterial> {
    private final CourseMaterialRepo courseMaterialRepo;

    public CourseMaterialService(CourseItemRepo courseItemRepo,
                                CompletedCourseItemRepo completedCourseItemRepo,
                                CourseMaterialRepo courseMaterialRepo) {
        super(courseItemRepo, completedCourseItemRepo);
        this.courseMaterialRepo = courseMaterialRepo;
    }

    @Override
    protected void updateFields(CourseMaterial existingItem, CourseMaterial updatedItem) {
        super.updateFields(existingItem, updatedItem);
        existingItem.setCourseMaterialType(updatedItem.getCourseMaterialType());
        existingItem.setUrl(updatedItem.getUrl());
        existingItem.setDescription(updatedItem.getDescription());
    }
}
