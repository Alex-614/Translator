package UserService.logic;

import UserService.logic.Entities.User;
import UserService.logic.Exceptions.DatabaseException;
import UserService.logic.Exceptions.DuplicateEmailException;
import UserService.logic.Respositories.UserRepository;
import org.hibernate.exception.ConstraintViolationException;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.BeanWrapper;
import org.springframework.beans.BeanWrapperImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.MissingServletRequestParameterException;

import java.util.*;

@Service
public class UserService implements UserPort {
    private final UserRepository userRepository;
    static Long userId = 0L;

    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public User createUser(String name, String email, String password) throws DuplicateEmailException, DatabaseException {
        User u = new User(name, email, password);
        try {
            return userRepository.save(u);
        } catch (DataAccessException e) {
            if (e.getCause() instanceof ConstraintViolationException constraintViolationException) {
                if ("23505".equals(constraintViolationException.getSQLState()) && constraintViolationException.getMessage().contains("user_email_key")) {
                    throw new DuplicateEmailException();
                } else {
                    throw new DatabaseException();
                }
            } else {
                throw new RuntimeException("Unexpected error occurred");
            }
        }
    }

    @Override
    public Optional<User> getUser(Long userId) {
        return userRepository.findById(userId);
    }

    @Override
    public Iterable<User> getAllUsers(){
        return userRepository.findAll();
    }

    @Override
    public Iterable<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public User patchUser(Long id, User patchedUser) {
        User existingUser = userRepository.findById(id).orElse(null);
        if (existingUser != null) {
            BeanUtils.copyProperties(patchedUser, existingUser, getNullPropertyNames(patchedUser));
            return userRepository.save(existingUser);
        }
        return null;
    }

    @Override
    public boolean deleteUser(Long userId){
        if(userRepository.existsById(userId)){
            userRepository.deleteById(userId);
            return true;
        }
        return false;
    }

    private static String[] getNullPropertyNames(Object source) {
        final BeanWrapper src = new BeanWrapperImpl(source);
        java.beans.PropertyDescriptor[] pds = src.getPropertyDescriptors();

        Set<String> emptyNames = new HashSet<>();
        for (java.beans.PropertyDescriptor pd : pds) {
            Object srcValue = src.getPropertyValue(pd.getName());
            if (srcValue == null) {
                emptyNames.add(pd.getName());
            }
        }

        String[] result = new String[emptyNames.size()];
        return emptyNames.toArray(result);
    }
}
