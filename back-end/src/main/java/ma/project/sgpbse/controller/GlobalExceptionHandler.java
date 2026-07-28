package ma.project.sgpbse.controller;

import ma.project.sgpbse.exception.user.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(UserNotExistException.class)
    public ProblemDetail handleUserNotExistException(UserNotExistException e){

        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST,
                e.getMessage()
        );

        problemDetail.setTitle("Opération refusée");
        return problemDetail;
    }

    @ExceptionHandler(UserPwdNotValidException.class)
    public ProblemDetail handleUserPwdNotValidException(UserPwdNotValidException e){

        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST,
                e.getMessage()
        );

        problemDetail.setTitle("Opération refusée");
        return problemDetail;
    }

    @ExceptionHandler(UserAlreadyExistException.class)
    public ProblemDetail handleUserAlreadyExistException(UserAlreadyExistException e){

        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST,
                e.getMessage()
        );

        problemDetail.setTitle("Opération refusée");
        return problemDetail;
    }

    @ExceptionHandler(RoleAlreadyExistException.class)
    public ProblemDetail handleRoleAlreadyExistException(RoleAlreadyExistException e){

        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST,
                e.getMessage()
        );

        problemDetail.setTitle("Opération refusée");
        return problemDetail;
    }

    @ExceptionHandler(PermissionNotExistException.class)
    public ProblemDetail handlePermissionNotExistException(PermissionNotExistException e){

        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST,
                e.getMessage()
        );

        problemDetail.setTitle("Opération refusée");
        return problemDetail;
    }
    @ExceptionHandler(RoleNotExistException.class)
    public ProblemDetail handleRoleNotExistException(RoleNotExistException e){

        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST,
                e.getMessage()
        );

        problemDetail.setTitle("Opération refusée");
        return problemDetail;
    }

}
