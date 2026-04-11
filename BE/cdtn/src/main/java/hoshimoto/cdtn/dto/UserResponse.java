package hoshimoto.cdtn.dto;

import hoshimoto.cdtn.entity.Enum.Role;
import lombok.Data;

@Data
public class UserResponse {
    private Long id;
    private String usercode;
    private String fullname;
    private String username;
    private String email;
    private String department;
    private Role role;
    private Boolean isActive;
}
