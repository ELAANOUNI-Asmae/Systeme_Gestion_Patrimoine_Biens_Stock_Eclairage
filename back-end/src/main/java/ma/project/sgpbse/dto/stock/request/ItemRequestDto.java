package ma.project.sgpbse.dto.stock.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ItemRequestDto {
    private Long providerId;
    private LocalDate requestDate;
    private Long quantity;
    private String reason;
}
