package hoshimoto.cdtn.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import hoshimoto.cdtn.entity.Enum.DocStatus;
import hoshimoto.cdtn.entity.GoodsIssue;

public interface GoodsIssueRepository extends JpaRepository<GoodsIssue, Long> {
    Optional<GoodsIssue> findByDocno(String docno);
    List<GoodsIssue> findByDocstatus(DocStatus docstatus);
    List<GoodsIssue> findAllByOrderByCreatedAtDesc();
}

