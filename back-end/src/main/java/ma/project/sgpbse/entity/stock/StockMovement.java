package ma.project.sgpbse.entity.stock;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import ma.project.sgpbse.entity.asset.Document;
import ma.project.sgpbse.entity.user.User;
import ma.project.sgpbse.enums.StockMovementType;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDate;
import java.util.List;
@Getter
@Setter


@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "stock_mov_type", discriminatorType = DiscriminatorType.STRING)
public abstract class StockMovement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate mouvementDate;
    private Long quantity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id")
    private Item item;


}
