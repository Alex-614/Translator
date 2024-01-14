package UserService.logic;

import UserService.logic.Entities.User;
import UserService.logic.Entities.User_Session;
import UserService.logic.Exceptions.DatabaseException;
import UserService.logic.Exceptions.DuplicateEmailException;
import UserService.logic.Respositories.UserRepository;
import UserService.logic.Respositories.UserSessionRepository;
import org.hibernate.exception.ConstraintViolationException;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.BeanWrapper;
import org.springframework.beans.BeanWrapperImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;

import java.util.*;

//service for CRUD operations in database (user + user_session)
@Service
public class UserService implements UserPort {
    private final UserRepository userRepository;
    private final UserSessionRepository userSessionRepository;
    static Long userId = 0L;

    @Autowired
    public UserService(UserRepository userRepository, UserSessionRepository userSessionRepository) {
        this.userRepository = userRepository;
        this.userSessionRepository = userSessionRepository;
    }

    ///////////////////////////////////////
    //Database operations for user entity//
    ///////////////////////////////////////

    //save user to database
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

    //get user from database by id
    @Override
    public Optional<User> getUser(Long userId) {
        return userRepository.findById(userId);
    }

    //get all users from database
    @Override
    public Iterable<User> getAllUsers(){
        return userRepository.findAll();
    }

    //get user from database by email
    @Override
    public Iterable<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    //patch user to database
    @Override
    public User patchUser(Long id, User patchedUser) {
        User existingUser = userRepository.findById(id).orElse(null);
        if (existingUser != null) {
            BeanUtils.copyProperties(patchedUser, existingUser, getNullPropertyNames(patchedUser));
            return userRepository.save(existingUser);
        }
        return null;
    }

    //delete user from database
    @Override
    public boolean deleteUser(Long userId){
        if(userRepository.existsById(userId)){
            userRepository.deleteById(userId);
            return true;
        }
        return false;
    }

    //helper method for patchUser
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

    ///////////////////////////////////////////////
    //Database operations for user_session entity//
    ///////////////////////////////////////////////

    //get all sessions created by a user (by user id)
    @Override
    public Iterable<User_Session> getAllSessions(Long userId) {
        return userSessionRepository.findByUserId(userId);
    }

    //create entry in database to map created sessions to user
    @Override
    public User_Session createUserToSession(Long user_id, String session_UUID) {
        User_Session us = new User_Session(user_id, session_UUID);
        return userSessionRepository.save(us);
    }
}
