package org.example.TextServiceLeader.logic;


import org.example.TextServiceLeader.logic.Entities.Text;

import java.sql.Timestamp;

public interface TextPort {
    Text createTextLine(String sessionUUID, Timestamp timestamp, String textLine);
    Iterable<Text> deleteSessionText(String sessionId);
}
