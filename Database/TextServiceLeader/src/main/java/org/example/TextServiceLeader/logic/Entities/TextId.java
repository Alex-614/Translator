package org.example.TextServiceLeader.logic.Entities;

import lombok.Getter;

import java.io.Serializable;
import java.sql.Timestamp;

@Getter
public class TextId implements Serializable {
    private Long sessionId;
    private Timestamp timestamp;

    public TextId() {}

    public TextId(Long sessionId, Timestamp timestamp) {
        this.sessionId = sessionId;
        this.timestamp = timestamp;
    }
}
