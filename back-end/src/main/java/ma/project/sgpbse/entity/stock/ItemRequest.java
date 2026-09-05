package ma.project.sgpbse.entity.stock;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import ma.project.sgpbse.entity.user.User;
import ma.project.sgpbse.enums.ItemRequestStatus;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor

@Entity
@Table(name = "itemRequest")
public class ItemRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long providerId;
    private LocalDate requestDate;
    @Enumerated(EnumType.STRING)
    private ItemRequestStatus status;
    private Long quantity;
    private boolean delivered = false;
    private String Justif;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id")
    private Item item;
}
