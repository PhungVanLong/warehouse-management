package hoshimoto.cdtn.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import hoshimoto.cdtn.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
}
