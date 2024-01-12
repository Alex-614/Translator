package org.example.TextServiceFollower.logic.Repositories;


import org.example.TextServiceFollower.logic.Entities.Text;
import org.example.TextServiceFollower.logic.Entities.TextId;
import org.springframework.data.repository.CrudRepository;

public interface FollowerTextRepository extends CrudRepository<Text, TextId> {
    Iterable<Text> findBySessionId(Long sessionId);
}
