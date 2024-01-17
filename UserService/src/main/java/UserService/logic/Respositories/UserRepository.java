package UserService.logic.Respositories;

import UserService.logic.Entities.User;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

//repository to connect to the user table in database
public interface UserRepository extends CrudRepository<User, Long> {
    Iterable<User> findByEmail(@Param("email") String firstname);
}
