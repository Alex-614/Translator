package UserService.logic.Respositories;

import UserService.logic.Entities.User;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UserRepository extends CrudRepository<User, Long> {
    Iterable<User> findByEmail(@Param("email") String firstname);
}
