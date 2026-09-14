package ma.project.sgpbse.entity.stock;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ma.project.sgpbse.entity.asset.Document;
import ma.project.sgpbse.enums.ItemRequestStatus;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
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
    private String reason;
    private LocalDate decisionDate;
    private LocalDate receivedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id")
    private Item item;

    @OneToMany(mappedBy = "itemRequest")
    private List<Document> documentList = new ArrayList<>();
}
