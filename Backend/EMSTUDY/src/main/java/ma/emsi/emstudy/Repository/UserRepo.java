package ma.emsi.emstudy.Repository;

import ma.emsi.emstudy.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepo extends JpaRepository<User, Long> {
}
