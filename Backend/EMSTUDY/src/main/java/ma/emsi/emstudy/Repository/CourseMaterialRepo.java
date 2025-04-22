package ma.emsi.emstudy.Repository;

import ma.emsi.emstudy.Entity.CourseMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CourseMaterialRepo extends JpaRepository<CourseMaterial, Integer> {

}

