package hoshimoto.cdtn.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import hoshimoto.cdtn.dto.request.UserRequest;
import hoshimoto.cdtn.dto.UserResponse;
import hoshimoto.cdtn.entity.User;
import hoshimoto.cdtn.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

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

    public User createUser(UserRequest request) {
        User user = new User();
        applyRequest(user, request);
        return userRepository.save(user);
    }

    public User updateUser(Long id, UserRequest request) {
        return userRepository.findById(id).map(u -> {
            applyRequest(u, request);
            u.setModifiedAt(LocalDateTime.now());
            return userRepository.save(u);
        }).orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên với id: " + id));
    }

    public void deleteUser(Long id) {
        userRepository.findById(id).map(u -> {
            u.setIsActive(false);
            u.setModifiedAt(LocalDateTime.now());
            return userRepository.save(u);
        }).orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên với id: " + id));
    }

    /**
     * Dùng lại cho AuthService nếu cần — convert UserResponse sang User entity.
     * @deprecated Dùng {@link #createUser(UserRequest)} thay thế.
     */
    @Deprecated
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
        return u;
    }

    private void applyRequest(User u, UserRequest request) {
        if (request.getUsercode() != null) u.setUsercode(request.getUsercode());
        if (request.getFullname() != null) u.setFullname(request.getFullname());
        if (request.getUsername() != null) u.setUsername(request.getUsername());
        if (request.getEmail() != null) u.setEmail(request.getEmail());
        if (request.getDepartment() != null) u.setDepartment(request.getDepartment());
        if (request.getPhoneNumber() != null) u.setPhoneNumber(request.getPhoneNumber());
        if (request.getAddress() != null) u.setAddress(request.getAddress());
        if (request.getGender() != null) u.setGender(request.getGender());
        if (request.getBankaccount() != null) u.setBankaccount(request.getBankaccount());
        if (request.getBankname() != null) u.setBankname(request.getBankname());
        if (request.getIsActive() != null) u.setIsActive(request.getIsActive());
        if (request.getRole() != null) {
            u.setRole(hoshimoto.cdtn.entity.Enum.Role.valueOf(request.getRole()));
        
        // Nếu có password (tạo mới hoặc đổi mật khẩu), hash và set
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
            u.setPasswordHash(encoder.encode(request.getPassword()));
        }
        }
        if (request.getModifiedBy() != null) u.setModifiedBy(request.getModifiedBy());
    }
}
