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

//adapter to connect to queue on RabbitMQ
@Component
public class MessageAdapter {
    private final LeaderTextRepository leaderTextRepository;

    @Autowired
    public MessageAdapter(LeaderTextRepository leaderTextRepository) {
        this.leaderTextRepository = leaderTextRepository;
    }

    //convert received String back to JSON and create Text entity to save it to database
    @RabbitListener(queues = "room_queue")
    public void receiveMessage(String message) {
        JSONObject json = new JSONObject(message);
        Timestamp timestamp = Timestamp.from(Instant.now());
        TextId textId = new TextId(json.getString("uuid"), timestamp);
        Text text = new Text(textId, json.getString("text"));
        leaderTextRepository.save(text);
    }
}