package ma.project.sgpbse.entity.stock;

import jakarta.persistence.*;
import lombok.*;
import ma.project.sgpbse.entity.user.User;

@Getter
@Setter
@NoArgsConstructor

@Entity
@DiscriminatorValue("OUT")
public class OutStock extends StockMovement {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User receiver;
}
