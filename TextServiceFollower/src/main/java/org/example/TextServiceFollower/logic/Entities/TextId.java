package org.example.TextServiceFollower.logic.Entities;

import lombok.Getter;

import java.io.Serializable;
import java.sql.Timestamp;

//represents the composite primary key as class, so it works with JPA
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
