package org.example.TextServiceLeader.logic;


import org.example.TextServiceLeader.logic.Entities.Text;

import java.sql.Timestamp;

//Port to just add entry in user_session
public interface TextPort {
    Text createTextLine(String sessionUUID, Timestamp timestamp, String textLine);
}
