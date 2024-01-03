package UserService.logic;

import UserService.logic.Entities.User;

import java.util.Optional;

public interface UserPort {
    User createUser(String name, String email, String password);
    Optional<User> getUser(Long userId);
    Iterable<User> getAllUsers();
    User patchUser(Long id, User patchedUser);
    boolean deleteUser(Long userId);
}
