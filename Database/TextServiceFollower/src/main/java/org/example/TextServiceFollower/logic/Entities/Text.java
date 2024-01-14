package org.example.TextServiceFollower.logic.Entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.sql.Timestamp;

//represents the text entity from the database
@Entity
@IdClass(TextId.class)
@Table(name = "Text")
@Getter
@Setter
public class Text {
    //composite primary key (sessionId, timestamp)
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
