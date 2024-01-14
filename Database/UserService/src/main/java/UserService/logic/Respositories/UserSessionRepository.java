package UserService.logic.Respositories;

import UserService.logic.Entities.User_Session;
import org.springframework.data.repository.CrudRepository;

//repository to connect to the user_session table in database
public interface UserSessionRepository extends CrudRepository<User_Session, Long> {
    Iterable<User_Session> findByUserId(Long userId);
}
