package hoshimoto.cdtn.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import hoshimoto.cdtn.entity.Location;

public interface LocationRepository extends JpaRepository<Location, Long> {
}
