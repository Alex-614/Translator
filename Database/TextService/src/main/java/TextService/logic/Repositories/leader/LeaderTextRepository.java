package TextService.logic.Repositories.leader;

import TextService.logic.Entities.Text;
import org.springframework.data.repository.CrudRepository;

public interface LeaderTextRepository extends CrudRepository<Text, Long> {
    Iterable<Text> deleteBySessionId(Long sessionId);
}
