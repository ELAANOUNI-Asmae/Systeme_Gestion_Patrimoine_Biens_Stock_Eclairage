package ma.project.sgpbse.entity;

import ma.project.sgpbse.enums.Gender;
import ma.project.sgpbse.enums.Role;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name="users")
@Getter

public class User implements UserDetails {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String email;
    private String firstname;
    private String lastname;
    @Enumerated(EnumType.STRING)
    private Gender gender;
    private String phone;
    private String cin;
    private String hash_pwd;
    @Enumerated(EnumType.STRING)
    private Role role;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities(){
        return List.of(new SimpleGrantedAuthority(role.name()));
    }

    @Override
    public String getPassword() {
        return getHash_pwd();
    }

    @Override
    public String getUsername() {
        return getEmail();
    }

    @Override public boolean isAccountNonExpired(){ return true;}
    @Override public boolean isAccountNonLocked(){ return true;}
    @Override public boolean isCredentialsNonExpired(){ return true;}
    @Override public boolean isEnabled(){ return true;}
}

