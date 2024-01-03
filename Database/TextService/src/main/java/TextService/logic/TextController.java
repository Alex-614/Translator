package TextService.logic;

import TextService.logic.Entities.Text;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
public class TextController {
    public final TextPort textPort;

    @Autowired
    public TextController(TextPort textPort) {
        this.textPort = textPort;
    }

    @GetMapping("/text/{sessionId}")
    public Iterable<Text> getSessionText(@PathVariable Long sessionId) {
        return textPort.getSessionText(sessionId);
    }


    @PostMapping("/text/{sessionId}")
    public Text createTextLine(
            @PathVariable Long sessionId,
            @RequestBody Map<String,String> body) {
        return textPort.createTextLine(sessionId, body.get("textLine"));
    }

    @DeleteMapping("/text/{sessionId}")
    public Iterable<Text> deleteSessionText(@PathVariable Long sessionId){
        return textPort.deleteSessionText(sessionId);
    }
}
