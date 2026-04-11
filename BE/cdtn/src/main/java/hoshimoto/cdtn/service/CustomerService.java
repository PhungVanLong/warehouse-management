package hoshimoto.cdtn.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import hoshimoto.cdtn.entity.Customer;
import hoshimoto.cdtn.repository.CustomerRepository;

@Service
public class CustomerService {
    @Autowired
    private CustomerRepository customerRepository;

    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    public Optional<Customer> getCustomerById(Long id) {
        return customerRepository.findById(id);
    }

    public Customer createCustomer(Customer customer) {
        return customerRepository.save(customer);
    }

    public Customer updateCustomer(Long id, Customer updated) {
        return customerRepository.findById(id).map(c -> {
            c.setCustomercode(updated.getCustomercode());
            c.setCustomername(updated.getCustomername());
            c.setAddress(updated.getAddress());
            c.setEmail(updated.getEmail());
            c.setMobile(updated.getMobile());
            c.setPartnername(updated.getPartnername());
            c.setPartnermobile(updated.getPartnermobile());
            c.setOwnername(updated.getOwnername());
            c.setTaxcode(updated.getTaxcode());
            c.setItemcatg(updated.getItemcatg());
            c.setBankaccount(updated.getBankaccount());
            c.setBankname(updated.getBankname());
            c.setIssupplier(updated.getIssupplier());
            c.setIscustomer(updated.getIscustomer());
            c.setModifiedAt(updated.getModifiedAt());
            c.setModifiedBy(updated.getModifiedBy());
            c.setIsActive(updated.getIsActive());
            return customerRepository.save(c);
        }).orElseThrow(() -> new RuntimeException("Customer not found"));
    }
}
