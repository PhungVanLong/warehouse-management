package hoshimoto.cdtn.entity;

import hoshimoto.cdtn.entity.Enum.Role;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.springdoc.ui.SpringDocUIException;

import java.time.LocalDateTime;

@Entity
@Table(name = "user")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true, nullable = false, length = 50)
    private String usercode;
    @Column( length = 200)
    private String fullname;

    @Column(unique = true, nullable = false, length = 100)
    private String username;

    @Column(unique = true, length = 150)
    private String email;

    @Column(nullable = false, name = "passwordhash",length = 255)
    private String passwordHash;

    @Column(length = 100)
    private String department;

    @Column(name = "phone",length = 20)
    private String phoneNumber;

    @Column(columnDefinition = "TEXT")
    private String address;

    @CreationTimestamp
    private LocalDateTime birthdate;

    @Column(length = 10)
    private String gender;

    @CreationTimestamp
    private LocalDateTime firstworkingdate;

    @Column(length = 50)
    private String bankaccount;

    @Column(length = 100)
    private String bankname;

    @CreationTimestamp
    @Column(updatable = false, name = "createdat")
    private LocalDateTime createdAt;

    @CreationTimestamp
    @Column(name="modifiedat")
    private LocalDateTime modifiedAt;

    @Column(length = 100,name = "modifiedby")
    private String modifiedBy;

    @Column(nullable = false,name = "isactive" )
    private Boolean isActive =true;

    @Column(length = 50, name = "rolename")
    @Enumerated
    private Role role;

    @CreationTimestamp
    private LocalDateTime lastlogin;

    @Column(name = "failedloginattempts")
    private Integer failedLoginAttempts;



}
