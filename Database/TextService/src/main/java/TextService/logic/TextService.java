package TextService.logic;

import TextService.logic.Entities.Text;
import TextService.logic.Entities.TextId;
import TextService.logic.Repositories.follower.FollowerTextRepository;
import TextService.logic.Repositories.leader.LeaderTextRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.Instant;

@Service
public class TextService implements TextPort{

    private final LeaderTextRepository leaderTextRepository;
    private final FollowerTextRepository followerTextRepository;

    @Autowired
    public TextService(LeaderTextRepository leaderTextRepository, FollowerTextRepository followerTextRepository) {
        this.leaderTextRepository = leaderTextRepository;
        this.followerTextRepository = followerTextRepository;
    }

    @Override
    @Transactional(transactionManager = "leaderTextTransactionManager", readOnly = false)
    public Text createTextLine(Long sessionId, String textLine) {
        Timestamp timestamp = Timestamp.from(Instant.now());
        TextId textId = new TextId(sessionId, timestamp);
        return leaderTextRepository.save(new Text(textId, textLine));
    }

    @Override
    @Transactional(transactionManager = "followerTextTransactionManager", readOnly = true)
    public Iterable<Text> getSessionText(Long sessionId) {
        return followerTextRepository.findBySessionId(sessionId);
    }

    @Override
    @Transactional(transactionManager = "leaderTextTransactionManager", readOnly = false)
    public Iterable<Text> deleteSessionText(Long sessionId) {
        return leaderTextRepository.deleteBySessionId(sessionId);
    }
}
