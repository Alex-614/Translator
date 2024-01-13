package UserService.logic.Entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "user_session")
@Getter
@Setter
public class User_Session {
    @Id
    @Column(name = "id")
    @SequenceGenerator(name = "user_id_seq", sequenceName = "user_session_id_seq")
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "user_session_id_seq")
    private Long id;
    @Column(name = "user_id")
    private Long userId;
    @Column(name = "session_UUID")
    private String sessionUUID;

    public User_Session(){}

    public User_Session(Long userId, String sessionUUID) {
        this.userId = userId;
        this.sessionUUID = sessionUUID;
    }
}
