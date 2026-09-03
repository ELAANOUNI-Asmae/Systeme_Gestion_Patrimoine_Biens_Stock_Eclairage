package ma.project.sgpbse.dto.stock.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
public class ItemRequestDto {

    private Long providerId;
    private LocalDate requestDate;
    private Long quantity;

}
