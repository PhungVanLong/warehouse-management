package hoshimoto.cdtn.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import hoshimoto.cdtn.entity.Enum.DocStatus;
import hoshimoto.cdtn.entity.GoodsReceipt;

public interface GoodsReceiptRepository extends JpaRepository<GoodsReceipt, Long> {
    Optional<GoodsReceipt> findByDocno(String docno);
    List<GoodsReceipt> findByDocstatus(DocStatus docstatus);
    List<GoodsReceipt> findAllByOrderByCreatedAtDesc();
}

