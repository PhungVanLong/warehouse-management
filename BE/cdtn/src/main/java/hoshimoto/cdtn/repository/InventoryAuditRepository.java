package hoshimoto.cdtn.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import hoshimoto.cdtn.entity.InventoryAudit;

public interface InventoryAuditRepository extends JpaRepository<InventoryAudit, Long> {
    Optional<InventoryAudit> findByDocno(String docno);
    List<InventoryAudit> findAllByOrderByCreatedAtDesc();
}
