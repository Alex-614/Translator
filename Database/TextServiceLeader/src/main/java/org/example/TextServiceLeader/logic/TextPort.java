package org.example.TextServiceLeader.logic;


import org.example.TextServiceLeader.logic.Entities.Text;

public interface TextPort {
    Text createTextLine(Long sessionId, String textLine);
    Iterable<Text> deleteSessionText(Long sessionId);
}
