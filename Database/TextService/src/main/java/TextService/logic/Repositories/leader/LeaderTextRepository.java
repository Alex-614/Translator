package TextService.logic.Repositories.leader;

import TextService.logic.Entities.Text;
import TextService.logic.Entities.TextId;
import org.springframework.data.repository.CrudRepository;

public interface LeaderTextRepository extends CrudRepository<Text, TextId> {
    Iterable<Text> deleteBySessionId(Long sessionId);
}
