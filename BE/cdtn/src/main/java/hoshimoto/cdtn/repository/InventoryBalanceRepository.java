package hoshimoto.cdtn.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import hoshimoto.cdtn.entity.InventoryBalance;

public interface InventoryBalanceRepository extends JpaRepository<InventoryBalance, Long> {
}
