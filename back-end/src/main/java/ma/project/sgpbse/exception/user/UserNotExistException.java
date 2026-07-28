package ma.project.sgpbse.exception.user;

public class UserNotExistException extends RuntimeException{

    public UserNotExistException(String message){
        super(message);
    }
}
