package ma.project.sgpbse.exception;

public class UserAlreadyConnectedException extends RuntimeException {
    public UserAlreadyConnectedException(String message) {
        super(message);
    }
}
