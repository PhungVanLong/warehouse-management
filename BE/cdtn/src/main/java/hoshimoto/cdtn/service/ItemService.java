package hoshimoto.cdtn.service;

import hoshimoto.cdtn.entity.Item;
import hoshimoto.cdtn.repository.ItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ItemService {
    @Autowired
    private ItemRepository itemRepository;

    public List<Item> getAllItems() {
        return itemRepository.findAll();
    }

    public Optional<Item> getItemById(Long id) {
        return itemRepository.findById(id);
    }

    public Item updateItem(Long id, Item updatedItem) {
        return itemRepository.findById(id).map(item -> {
            item.setItemcode(updatedItem.getItemcode());
            item.setBarcode(updatedItem.getBarcode());
            item.setItemname(updatedItem.getItemname());
            item.setInvoicename(updatedItem.getInvoicename());
            item.setDescription(updatedItem.getDescription());
            item.setItemtype(updatedItem.getItemtype());
            item.setUnitof(updatedItem.getUnitof());
            item.setItemcatg(updatedItem.getItemcatg());
            item.setMinstocklevel(updatedItem.getMinstocklevel());
            item.setModifiedAt(updatedItem.getModifiedAt());
            item.setModifiedBy(updatedItem.getModifiedBy());
            return itemRepository.save(item);
        }).orElseThrow(() -> new RuntimeException("Item not found"));
    }
}
