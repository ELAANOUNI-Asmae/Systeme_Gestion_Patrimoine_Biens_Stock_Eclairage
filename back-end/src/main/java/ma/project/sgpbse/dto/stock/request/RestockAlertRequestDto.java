package ma.project.sgpbse.dto.stock.request;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class RestockAlertRequestDto {
    private Long requestedQuantity;
    private String reason;
}
