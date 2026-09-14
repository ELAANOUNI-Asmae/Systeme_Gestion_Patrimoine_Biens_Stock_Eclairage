package ma.project.sgpbse.dto.stock.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RestockAlertResponseDto {
    private Long id;
    private Long articleId;
    private String articleDesignation;
    private String articleDesignationAr;
    private Long requestedQuantity;
    private Long availableQuantityAtRequest;
    private Long requesterId;
    private String requester;
    private String reason;
    private LocalDate createdAt;
    private String status;
    private LocalDate readyNotifiedAt;
}
