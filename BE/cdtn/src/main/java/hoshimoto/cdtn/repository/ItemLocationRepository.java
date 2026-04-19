package hoshimoto.cdtn.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import hoshimoto.cdtn.entity.ItemLocation;

public interface ItemLocationRepository extends JpaRepository<ItemLocation, Long> {

    List<ItemLocation> findByItemIdAndIsActiveTrue(Long itemId);

    Optional<ItemLocation> findByItemIdAndLocationId(Long itemId, Long locationId);

    /**
     * Lấy vị trí đang chứa sản phẩm này với số lượng tồn >= requiredQty (dùng cho xuất kho)
     */
    @Query("SELECT il FROM ItemLocation il WHERE il.item.id = :itemId AND il.isActive = true AND il.quantity >= :requiredQty")
    List<ItemLocation> findAvailableForIssue(@Param("itemId") Long itemId, @Param("requiredQty") java.math.BigDecimal requiredQty);

    /**
     * Lấy vị trí đang chứa sản phẩm này còn chỗ (capacity - quantity > 0) (dùng để gợi ý nhập kho)
     */
    @Query("SELECT il FROM ItemLocation il WHERE il.item.id = :itemId AND il.isActive = true AND il.location.capacity > il.quantity")
    List<ItemLocation> findLocationsWithSpaceForItem(@Param("itemId") Long itemId);
}

