package org.example.TextServiceLeader.logic;

import org.example.TextServiceLeader.logic.Entities.Text;
import org.example.TextServiceLeader.logic.Entities.TextId;
import org.example.TextServiceLeader.logic.Repositories.LeaderTextRepository;
import org.json.JSONObject;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.sql.Timestamp;
import java.time.Instant;

@Component
public class MessageAdapter {
    private final LeaderTextRepository leaderTextRepository;

    @Autowired
    public MessageAdapter(LeaderTextRepository leaderTextRepository) {
        this.leaderTextRepository = leaderTextRepository;
    }
    @RabbitListener(queues = "room_queue")
    public void receiveMessage(String message) {
        JSONObject json = new JSONObject(message);
        Timestamp timestamp = Timestamp.from(Instant.now());
        TextId textId = new TextId(json.getString("uuid"), timestamp);
        Text text = new Text(textId, json.getString("text"));
        System.out.println(json);
        System.out.println(json.getString("uuid"));
        leaderTextRepository.save(text);
    }
}