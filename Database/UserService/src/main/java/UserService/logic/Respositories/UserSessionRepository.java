package UserService.logic.Respositories;

import UserService.logic.Entities.User;
import UserService.logic.Entities.User_Session;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

public interface UserSessionRepository extends CrudRepository<User_Session, Long> {
    Iterable<String> findByUserId(@Param("user_id") Long user_id);
}
