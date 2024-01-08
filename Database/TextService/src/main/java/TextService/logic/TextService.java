package TextService.logic;

import TextService.logic.Entities.Text;
import TextService.logic.Entities.TextId;
import TextService.logic.Repositories.follower.FollowerTextRepository;
import TextService.logic.Repositories.leader.LeaderTextRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
    public Text createTextLine(Long sessionId, String textLine) {
        Timestamp timestamp = Timestamp.from(Instant.now());
        TextId textId = new TextId(sessionId, timestamp);
        return leaderTextRepository.save(new Text(textId, textLine));
    }

    @Override
    public Iterable<Text> getSessionText(Long sessionId) {
        return followerTextRepository.findBySessionId(sessionId);
    }

    @Override
    @Transactional
    public Iterable<Text> deleteSessionText(Long sessionId) {
        return leaderTextRepository.deleteBySessionId(sessionId);
    }
}
