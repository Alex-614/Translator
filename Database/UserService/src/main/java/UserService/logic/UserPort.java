package UserService.logic;

import UserService.logic.Entities.User;
import UserService.logic.Entities.User_Session;
import UserService.logic.Exceptions.DatabaseException;
import UserService.logic.Exceptions.DuplicateEmailException;

import java.util.Optional;

//port for user/user_service table
public interface UserPort {
    User createUser(String name, String email, String password) throws DuplicateEmailException, DatabaseException;
    User_Session createUserToSession(Long user_id, String session_UUID);
    Optional<User> getUser(Long userId);
    Iterable<User_Session> getAllSessions(Long userId);
    Iterable<User> getAllUsers();
    Iterable<User> findByEmail(String email);
    User patchUser(Long id, User patchedUser);
    boolean deleteUser(Long userId);
}
