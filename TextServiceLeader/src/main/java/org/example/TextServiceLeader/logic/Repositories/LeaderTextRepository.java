package org.example.TextServiceLeader.logic.Repositories;


import org.example.TextServiceLeader.logic.Entities.Text;
import org.example.TextServiceLeader.logic.Entities.TextId;
import org.springframework.data.repository.CrudRepository;

//repository for the follower database (for write, delete)
public interface LeaderTextRepository extends CrudRepository<Text, TextId> {
    Iterable<Text> deleteBySessionId(String sessionId);
}
