package UserService.logic;

import UserService.logic.Entities.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
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

    @PostMapping("/user")
    public User createUser(@RequestBody Map<String,String> body) throws DuplicateEmailException, DatabaseException {
        return myUserPort.createUser(body.get("name"), body.get("email"), body.get("password"));
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
