package TextService.logic;

import TextService.logic.Entities.Text;

public interface TextPort {
    Text createTextLine(Long sessionId, String textLine);
    Iterable<Text> getSessionText(Long sessionId);
    Iterable<Text> deleteSessionText(Long sessionId);
}
