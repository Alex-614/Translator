package org.example.TextServiceFollower.logic;

import org.example.TextServiceFollower.logic.Entities.Text;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

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
}
