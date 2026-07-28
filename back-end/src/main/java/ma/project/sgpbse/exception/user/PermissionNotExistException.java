package ma.project.sgpbse.exception.user;

public class PermissionNotExistException extends RuntimeException {
    public PermissionNotExistException(String message) {
        super(message);
    }
}
