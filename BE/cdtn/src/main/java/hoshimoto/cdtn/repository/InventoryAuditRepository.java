package hoshimoto.cdtn.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import hoshimoto.cdtn.entity.InventoryAudit;

public interface InventoryAuditRepository extends JpaRepository<InventoryAudit, Long> {
}
