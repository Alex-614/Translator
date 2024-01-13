package org.example.TextServiceLeader.logic.Entities;

import lombok.Getter;

import java.io.Serializable;
import java.sql.Timestamp;

@Getter
public class TextId implements Serializable {
    private String sessionId;
    private Timestamp timestamp;

    public TextId() {}

    public TextId(String sessionId, Timestamp timestamp) {
        this.sessionId = sessionId;
        this.timestamp = timestamp;
    }
}
