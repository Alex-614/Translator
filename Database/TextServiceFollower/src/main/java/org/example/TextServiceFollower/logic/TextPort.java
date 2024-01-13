package org.example.TextServiceFollower.logic;


import org.example.TextServiceFollower.logic.Entities.Text;

public interface TextPort {
    Iterable<Text> getSessionText(String sessionId);
}
