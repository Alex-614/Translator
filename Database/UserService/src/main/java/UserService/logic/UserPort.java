package UserService.logic;

import UserService.logic.Entities.User;

import java.util.List;
import java.util.Optional;

public interface UserPort {
    public User createUser(String firstname, String name, String email, String password);
    public Optional<User> getUser(Long userId);
    public Iterable<User> getAllUsers();
    public User patchUser(Long id, User patchedUser);
    public boolean deleteUser(Long userId);
}
