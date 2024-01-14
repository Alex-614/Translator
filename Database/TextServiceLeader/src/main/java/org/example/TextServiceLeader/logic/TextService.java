package org.example.TextServiceLeader.logic;

import org.example.TextServiceLeader.logic.Entities.Text;
import org.example.TextServiceLeader.logic.Entities.TextId;
import org.example.TextServiceLeader.logic.Repositories.LeaderTextRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;


//Service to connect to database for CRUD operations
@Service
public class TextService implements TextPort {

    private final LeaderTextRepository leaderTextRepository;

    @Autowired
    public TextService(LeaderTextRepository leaderTextRepository) {
        this.leaderTextRepository = leaderTextRepository;
    }

    @Override
    public Text createTextLine(String sessionUUID, Timestamp timestamp, String textLine) {
        TextId textId = new TextId(sessionUUID, timestamp);
        return leaderTextRepository.save(new Text(textId, textLine));
    }
}
