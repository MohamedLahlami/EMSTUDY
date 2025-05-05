package ma.emsi.emstudy.Service;

import lombok.RequiredArgsConstructor;
import ma.emsi.emstudy.Entity.CourseMaterial;
import ma.emsi.emstudy.Exception.ResourceNotFoundException;
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

    public CourseMaterial updateCourseMaterial(Long courseMaterialId, CourseMaterial updatedCourseMaterial) {
        CourseMaterial existingCourseMaterial = courseMaterialRepo.findById(courseMaterialId)
                .orElseThrow(() -> new ResourceNotFoundException("CourseMaterial not found with id: " + courseMaterialId));
        //courseItem firlds
        existingCourseMaterial.setTitle(updatedCourseMaterial.getTitle());
        //courseMaterial fields
        existingCourseMaterial.setUrl(updatedCourseMaterial.getUrl());
        existingCourseMaterial.setCourseMaterialType(updatedCourseMaterial.getCourseMaterialType());
        existingCourseMaterial.setCourse(updatedCourseMaterial.getCourse());
        return courseMaterialRepo.save(existingCourseMaterial);
    }
}