package TextService.logic;

import TextService.logic.Entities.Text;
import TextService.logic.Entities.TextId;
import TextService.logic.Repositories.TextRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.Instant;

@Service
public class TextService implements TextPort{
    private final TextRepository textRepository;

    @Autowired
    public TextService(TextRepository textRepository) {
        this.textRepository = textRepository;
    }

    @Override
    public Text createTextLine(Long sessionId, String textLine) {
        Timestamp timestamp = Timestamp.from(Instant.now());
        TextId textId = new TextId(sessionId, timestamp);
        return textRepository.save(new Text(textId, textLine));
    }

    @Override
    public Iterable<Text> getSessionText(Long sessionId) {
        return textRepository.findBySessionId(sessionId);
    }

    @Override
    @Transactional
    public Iterable<Text> deleteSessionText(Long sessionId) {
        return textRepository.deleteBySessionId(sessionId);
    }
}
