package org.example.TextServiceFollower.logic.Repositories;


import org.example.TextServiceFollower.logic.Entities.Text;
import org.example.TextServiceFollower.logic.Entities.TextId;
import org.springframework.data.repository.CrudRepository;

//repository for the follower database, just used to read from the database
public interface FollowerTextRepository extends CrudRepository<Text, TextId> {
    Iterable<Text> findBySessionId(String sessionId);
}
