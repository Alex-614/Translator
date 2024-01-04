package TextService.logic.Entities;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
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
    private Long sessionId;
    @Id
    private Timestamp timestamp;
    private String textLine;

    public Text(){}

    public Text(TextId textId, String textLine) {
        this.sessionId = textId.getSessionId();
        this.timestamp = textId.getTimestamp();
        this.textLine = textLine;
    }
}
