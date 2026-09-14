package ma.project.sgpbse.dto.stock.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ItemRequestResponseDto {
    private Long id;
    private Long articleId;
    private String articleDesignation;
    private String articleDesignationAr;
    private Long requestedQuantity;
    private Long requesterId;
    private String requester;
    private String reason;
    private LocalDate requestDate;
    private String status;
    private String rejectionReason;
    private LocalDate decisionDate;
    private LocalDate receivedAt;
    private List<StockDocumentResponseDto> documents = new ArrayList<>();
}
