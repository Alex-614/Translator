package UserService.logic;

import UserService.logic.Entities.User;
import UserService.logic.Entities.User_Session;
import UserService.logic.Exceptions.DatabaseException;
import UserService.logic.Exceptions.DuplicateEmailException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "http://angular-application:80")
public class UserController {
    private final UserPort myUserPort;

    @Autowired
    public UserController(UserPort myUserPort) {
        this.myUserPort = myUserPort;
    }

    @GetMapping("/user")
    public Iterable<User> all(){
        return myUserPort.getAllUsers();
    }

    @GetMapping("/user/{id}")
    public Optional<User> one(@PathVariable Long id) {
        return myUserPort.getUser(id);
    }

    @GetMapping("/user_session/{userId}")
    public Iterable<User_Session> allSession(@PathVariable Long userId) {
        return myUserPort.getAllSessions(userId);
    }

    @GetMapping("/user/search")
    public Iterable<User> search(
            @RequestParam(name = "email", defaultValue = "") String email) throws MissingServletRequestParameterException {
        if(!email.isEmpty())
            return myUserPort.findByEmail(email);
        throw new MissingServletRequestParameterException("email", "String");
    }

    @PostMapping("/user")
    public User createUser(@RequestBody Map<String,String> body) throws DuplicateEmailException, DatabaseException {
        return myUserPort.createUser(body.get("name"), body.get("email"), body.get("password"));
    }

    @PostMapping("/user_session")
    public User_Session createUserToSession(@RequestBody Map<String,String> body) {
        return myUserPort.createUserToSession(Long.parseLong(body.get("user_id")), body.get("session_UUID"));
    }

    @PatchMapping("user/{id}")
    public User patchUser(@PathVariable Long id, @RequestBody User patchedUser){
        return myUserPort.patchUser(id, patchedUser);
    }

    @DeleteMapping("/user/{id}")
    public boolean deleteUser(@PathVariable Long id){
        return myUserPort.deleteUser(id);
    }
}
