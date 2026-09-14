package ma.project.sgpbse.entity.stock;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ma.project.sgpbse.entity.asset.Document;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@Entity
@DiscriminatorValue("IN")
public class InStock extends StockMovement {
    private Double unitEntryPrice;
    private int vat;
    private Double totalExcludingTax;
    private Double totalIncludingTax;
    private String supplierName;
    private String operationRef;

    @OneToMany(mappedBy = "inStock")
    private List<Document> documentList = new ArrayList<>();
}
