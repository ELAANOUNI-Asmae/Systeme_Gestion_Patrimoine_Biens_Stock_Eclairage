package ma.project.sgpbse.entity;

import ma.project.sgpbse.enums.Gender;
import ma.project.sgpbse.enums.Role;
import jakarta.persistence.*;
import lombok.*;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name="user")

public class User {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String email;
    private String hash_pwd;
    private String sault;
    private Role role;
    private String firstname;
    private String lastname;
    private Gender gender;
    private String tel;
    private String cin;
}

