package hoshimoto.cdtn.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import hoshimoto.cdtn.entity.ItemLocation;

public interface ItemLocationRepository extends JpaRepository<ItemLocation, Long> {
}
