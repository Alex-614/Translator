package TextService.logic.Repositories;

import TextService.logic.Entities.Text;
import TextService.logic.Entities.TextId;
import org.springframework.data.repository.CrudRepository;


public interface TextRepository extends CrudRepository<Text, TextId> {
    Iterable<Text> findBySessionId(Long sessionId);
    Iterable<Text> deleteBySessionId(Long sessionId);
}
