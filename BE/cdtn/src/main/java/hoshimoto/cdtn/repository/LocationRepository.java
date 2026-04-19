package hoshimoto.cdtn.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import hoshimoto.cdtn.entity.Location;

public interface LocationRepository extends JpaRepository<Location, Long> {

    Optional<Location> findByLocationcode(String locationcode);

    /**
     * Vị trí đang trống hoàn toàn (không có ItemLocation active nào) và còn chứa được requiredQty
     */
    @Query("SELECT l FROM Location l WHERE l.isActive = true AND l.capacity >= :requiredQty " +
           "AND l.id NOT IN (SELECT il.location.id FROM ItemLocation il WHERE il.isActive = true AND il.quantity > 0)")
    List<Location> findEmptyLocationsWithCapacity(@Param("requiredQty") java.math.BigDecimal requiredQty);
}

