package UserService.logic.Respositories;

import UserService.logic.Entities.User_Session;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

public interface UserSessionRepository extends CrudRepository<User_Session, Long> {
    Iterable<User_Session> findByUserId(Long userId);
}
