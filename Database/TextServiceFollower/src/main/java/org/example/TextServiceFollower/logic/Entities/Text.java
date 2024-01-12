package org.example.TextServiceFollower.logic.Entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.sql.Timestamp;

@Entity
@IdClass(TextId.class)
@Table(name = "Text")
@Getter
@Setter
public class Text {
    @Id
    @Column(name = "session_id")
    private String sessionId;
    @Id
    @Column(name = "timestamp")
    private Timestamp timestamp;
    @Column(name = "text_line")
    private String textLine;

    public Text(){}

    public Text(TextId textId, String textLine) {
        this.sessionId = textId.getSessionId();
        this.timestamp = textId.getTimestamp();
        this.textLine = textLine;
    }
}
