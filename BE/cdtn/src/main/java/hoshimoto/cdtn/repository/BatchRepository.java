package hoshimoto.cdtn.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import hoshimoto.cdtn.entity.Batch;

public interface BatchRepository extends JpaRepository<Batch, Long> {
    Optional<Batch> findByBatchCode(String batchCode);
    List<Batch> findAllByOrderByCreatedAtDesc();
    List<Batch> findAllByBatchCodeStartingWithOrderByBatchCodeDesc(String prefix);
}
