package ma.project.sgpbse.entity.user;

import io.jsonwebtoken.lang.Collections;
import ma.project.sgpbse.entity.publicLighting.Intervention;
import ma.project.sgpbse.entity.stock.ItemRequest;
import ma.project.sgpbse.entity.stock.OutStock;
import ma.project.sgpbse.entity.stock.StockMovement;
import ma.project.sgpbse.enums.AccountStatus;
import ma.project.sgpbse.enums.Gender;
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
    private String firstname_fr;
    private String firstname_ar;
    private String lastname_fr;
    private String lastname_ar;
    @Enumerated(EnumType.STRING)
    private Gender gender;
    private String phone;
    private String cin;
    private String hash_pwd;
    @Enumerated(EnumType.STRING)
    private AccountStatus accountStatus;
    private String serviceName;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id")
    private Role role;

    @OneToMany(mappedBy = "receiver")
    private List<OutStock> outStockList;

    @OneToMany(mappedBy = "technician")
    private List<Intervention> interventionList;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (this.role == null) {
            return List.of();
        }
        return List.of(new SimpleGrantedAuthority(this.role.getName()));
    }

    @Override
    public String getPassword() { return this.hash_pwd; }

    @Override
    public String getUsername() { return this.email; }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() {
        return this.accountStatus == AccountStatus.ACTIVE;
    }


}

