package org.example.TextServiceLeader.logic.Repositories;


import org.example.TextServiceLeader.logic.Entities.Text;
import org.example.TextServiceLeader.logic.Entities.TextId;
import org.springframework.data.repository.CrudRepository;

public interface LeaderTextRepository extends CrudRepository<Text, TextId> {
    Iterable<Text> deleteBySessionId(String sessionId);
}
