package ma.project.sgpbse.controller;

import ma.project.sgpbse.exception.publicLighting.LightPointNotExistException;
import ma.project.sgpbse.exception.stock.ItemAlreadyExistException;
import ma.project.sgpbse.exception.stock.ItemNotExistException;
import ma.project.sgpbse.exception.user.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.DisabledException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(DisabledException.class)
    public ResponseEntity<Map<String, String>> handleDisabledAccount(DisabledException ex) {
        Map<String, String> response = new HashMap<>();
        response.put("error", ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

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
    @ExceptionHandler(ItemAlreadyExistException.class)
    public ProblemDetail handleItemAlreadyExistException(ItemAlreadyExistException e){

        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST,
                e.getMessage()
        );

        problemDetail.setTitle("Opération refusée");
        return problemDetail;
    }

    @ExceptionHandler(ItemNotExistException.class)
    public ProblemDetail handleItemNotExistException(ItemNotExistException e){

        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST,
                e.getMessage()
        );

        problemDetail.setTitle("Opération refusée");
        return problemDetail;
    }
    @ExceptionHandler(LightPointNotExistException.class)
    public ProblemDetail handleLightPointNotExistException(LightPointNotExistException e){

        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST,
                e.getMessage()
        );

        problemDetail.setTitle("Opération refusée");
        return problemDetail;
    }

}
