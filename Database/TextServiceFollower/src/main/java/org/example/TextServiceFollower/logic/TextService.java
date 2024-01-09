package org.example.TextServiceFollower.logic;

import org.example.TextServiceFollower.logic.Entities.Text;
import org.example.TextServiceFollower.logic.Repositories.FollowerTextRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TextService implements TextPort {

    private final FollowerTextRepository followerTextRepository;

    @Autowired
    public TextService(FollowerTextRepository leaderTextRepository) {
        this.followerTextRepository = leaderTextRepository;
    }

    @Override
    @Transactional(transactionManager = "followerTextTransactionManager", readOnly = true)
    public Iterable<Text> getSessionText(Long sessionId) {
        return followerTextRepository.findBySessionId(sessionId);
    }
}
