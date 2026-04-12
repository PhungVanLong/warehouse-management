package hoshimoto.cdtn.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import hoshimoto.cdtn.dto.UserResponse;
import hoshimoto.cdtn.entity.User;
import hoshimoto.cdtn.repository.UserRepository;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public User createUser(User user) {
        return userRepository.save(user);
    }

    public User updateUser(Long id, UserResponse dto) {
        return userRepository.findById(id).map(u -> {
            u.setUsercode(dto.getUsercode());
            u.setFullname(dto.getFullname());
            u.setUsername(dto.getUsername());
            u.setEmail(dto.getEmail());
            u.setDepartment(dto.getDepartment());
            u.setPhoneNumber(dto.getPhoneNumber());
            u.setAddress(dto.getAddress());
            // birthdate, firstworkingdate, createdAt giữ nguyên
            u.setGender(dto.getGender());
            u.setBankaccount(dto.getBankaccount());
            u.setBankname(dto.getBankname());
            u.setModifiedAt(dto.getModifiedAt() != null ? java.time.LocalDateTime.parse(dto.getModifiedAt()) : null);
            u.setModifiedBy(dto.getModifiedBy());
            u.setIsActive(dto.getIsActive());
            u.setRole(dto.getRole() != null ? hoshimoto.cdtn.entity.Enum.Role.valueOf(dto.getRole()) : null);
            u.setLastlogin(dto.getLastlogin() != null ? java.time.LocalDateTime.parse(dto.getLastlogin()) : null);
            u.setFailedLoginAttempts(dto.getFailedLoginAttempts());
            return userRepository.save(u);
        }).orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User fromDto(UserResponse dto) {
        User u = new User();
        u.setUsercode(dto.getUsercode());
        u.setFullname(dto.getFullname());
        u.setUsername(dto.getUsername());
        u.setEmail(dto.getEmail());
        u.setDepartment(dto.getDepartment());
        u.setPhoneNumber(dto.getPhoneNumber());
        u.setAddress(dto.getAddress());
        u.setGender(dto.getGender());
        u.setBankaccount(dto.getBankaccount());
        u.setBankname(dto.getBankname());
        u.setIsActive(dto.getIsActive());
        u.setRole(dto.getRole() != null ? hoshimoto.cdtn.entity.Enum.Role.valueOf(dto.getRole()) : null);
        u.setFailedLoginAttempts(dto.getFailedLoginAttempts());
        // birthdate, createdAt, firstworkingdate, lastlogin, modifiedAt sẽ tự động hoặc cập nhật ở tầng entity
        return u;
    }
}
