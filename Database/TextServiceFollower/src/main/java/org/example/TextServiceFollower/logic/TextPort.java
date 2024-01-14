package org.example.TextServiceFollower.logic;


import org.example.TextServiceFollower.logic.Entities.Text;

//follower Port to database (read-only)
public interface TextPort {
    Iterable<Text> getSessionText(String sessionId);
}
