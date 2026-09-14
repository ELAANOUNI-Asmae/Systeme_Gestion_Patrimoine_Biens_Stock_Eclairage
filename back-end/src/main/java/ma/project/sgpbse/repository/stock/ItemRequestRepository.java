package ma.project.sgpbse.repository.stock;

import ma.project.sgpbse.entity.stock.ItemRequest;
import ma.project.sgpbse.enums.ItemRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemRequestRepository extends JpaRepository<ItemRequest, Long> {
    Long countByStatus(ItemRequestStatus status);
    List<ItemRequest> findAllByProviderId(Long providerId);
    List<ItemRequest> findByItemIdAndStatus(Long itemId, ItemRequestStatus status);
    List<ItemRequest> findAllByOrderByRequestDateDescIdDesc();
}
