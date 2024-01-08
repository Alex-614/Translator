package TextService.logic.Repositories.follower;

import TextService.logic.Entities.Text;
import org.springframework.data.repository.CrudRepository;

public interface FollowerTextRepository extends CrudRepository<Text, Long> {
    Iterable<Text> findBySessionId(Long sessionId);
}
