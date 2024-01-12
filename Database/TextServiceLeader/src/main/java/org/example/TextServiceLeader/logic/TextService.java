package org.example.TextServiceLeader.logic;

import org.example.TextServiceLeader.logic.Entities.Text;
import org.example.TextServiceLeader.logic.Entities.TextId;
import org.example.TextServiceLeader.logic.Repositories.LeaderTextRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.Instant;

@Service
public class TextService implements TextPort {

    private final LeaderTextRepository leaderTextRepository;

    @Autowired
    public TextService(LeaderTextRepository leaderTextRepository) {
        this.leaderTextRepository = leaderTextRepository;
    }

    @Override
    public Text createTextLine(Long sessionId, String textLine) {
        Timestamp timestamp = Timestamp.from(Instant.now());
        TextId textId = new TextId(sessionId, timestamp);
        return leaderTextRepository.save(new Text(textId, textLine));
    }


    @Override
    public Iterable<Text> deleteSessionText(Long sessionId) {
        return leaderTextRepository.deleteBySessionId(sessionId);
    }
}
