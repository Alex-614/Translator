package org.example.TextServiceFollower.logic;

import org.example.TextServiceFollower.logic.Entities.Text;
import org.example.TextServiceFollower.logic.Repositories.FollowerTextRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

//service to connect to the database (read-only)
@Service
public class TextService implements TextPort {

    private final FollowerTextRepository followerTextRepository;

    @Autowired
    public TextService(FollowerTextRepository leaderTextRepository) {
        this.followerTextRepository = leaderTextRepository;
    }

    @Override
    public Iterable<Text> getSessionText(String sessionId) {
        return followerTextRepository.findBySessionId(sessionId);
    }
}
