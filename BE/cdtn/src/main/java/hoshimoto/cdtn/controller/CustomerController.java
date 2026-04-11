package hoshimoto.cdtn.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import hoshimoto.cdtn.dto.ApiResponse;
import hoshimoto.cdtn.dto.CustomerResponse;
import hoshimoto.cdtn.entity.Customer;
import hoshimoto.cdtn.service.CustomerService;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {
    @Autowired
    private CustomerService customerService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CustomerResponse>>> getAllCustomers() {
        List<CustomerResponse> list = customerService.getAllCustomers().stream().map(CustomerController::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách đối tượng thành công", list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomerResponse>> getCustomerById(@PathVariable Long id) {
        return customerService.getCustomerById(id)
                .map(c -> ResponseEntity.ok(new ApiResponse<>(true, "Lấy chi tiết đối tượng thành công", toDto(c))))
                .orElseGet(() -> ResponseEntity.status(404).body(new ApiResponse<>(false, "Không tìm thấy đối tượng", null)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CustomerResponse>> createCustomer(@RequestBody Customer customer) {
        Customer created = customerService.createCustomer(customer);
        return ResponseEntity.ok(new ApiResponse<>(true, "Tạo mới đối tượng thành công", toDto(created)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomerResponse>> updateCustomer(@PathVariable Long id, @RequestBody Customer customer) {
        try {
            Customer updated = customerService.updateCustomer(id, customer);
            return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật đối tượng thành công", toDto(updated)));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    private static CustomerResponse toDto(Customer c) {
        CustomerResponse dto = new CustomerResponse();
        dto.setId(c.getId());
        dto.setCustomercode(c.getCustomercode());
        dto.setCustomername(c.getCustomername());
        dto.setAddress(c.getAddress());
        dto.setEmail(c.getEmail());
        dto.setMobile(c.getMobile());
        dto.setPartnername(c.getPartnername());
        dto.setPartnermobile(c.getPartnermobile());
        dto.setOwnername(c.getOwnername());
        dto.setTaxcode(c.getTaxcode());
        dto.setItemcatg(c.getItemcatg());
        dto.setBankaccount(c.getBankaccount());
        dto.setBankname(c.getBankname());
        dto.setIssupplier(c.getIssupplier());
        dto.setIscustomer(c.getIscustomer());
        dto.setCreatedAt(c.getCreatedAt() != null ? c.getCreatedAt().toString() : null);
        dto.setModifiedAt(c.getModifiedAt() != null ? c.getModifiedAt().toString() : null);
        dto.setModifiedBy(c.getModifiedBy());
        dto.setIsActive(c.getIsActive());
        return dto;
    }
}
