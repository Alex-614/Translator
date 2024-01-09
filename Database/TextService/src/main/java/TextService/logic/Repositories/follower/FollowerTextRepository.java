package TextService.logic.Repositories.follower;

import TextService.logic.Entities.Text;
import TextService.logic.Entities.TextId;
import jakarta.persistence.QueryHint;
import org.springframework.data.jpa.repository.QueryHints;
import org.springframework.data.repository.CrudRepository;

public interface FollowerTextRepository extends CrudRepository<Text, TextId> {
    @QueryHints(value = @QueryHint(name = org.hibernate.annotations.QueryHints.READ_ONLY, value = "true"))
    Iterable<Text> findBySessionId(Long sessionId);
}
