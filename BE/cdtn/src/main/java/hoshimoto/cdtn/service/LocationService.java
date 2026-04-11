package hoshimoto.cdtn.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import hoshimoto.cdtn.entity.Location;
import hoshimoto.cdtn.repository.LocationRepository;

@Service
public class LocationService {
    @Autowired
    private LocationRepository locationRepository;

    public List<Location> getAllLocations() {
        return locationRepository.findAll();
    }

    public Optional<Location> getLocationById(Long id) {
        return locationRepository.findById(id);
    }

    public Location createLocation(Location location) {
        return locationRepository.save(location);
    }

    public Location updateLocation(Long id, Location updated) {
        return locationRepository.findById(id).map(l -> {
            l.setLocationcode(updated.getLocationcode());
            l.setLocationname(updated.getLocationname());
            l.setRackno(updated.getRackno());
            l.setFloorno(updated.getFloorno());
            l.setColumnno(updated.getColumnno());
            l.setCapacity(updated.getCapacity());
            l.setDescription(updated.getDescription());
            l.setIsActive(updated.getIsActive());
            l.setModifiedAt(updated.getModifiedAt());
            l.setModifiedBy(updated.getModifiedBy());
            return locationRepository.save(l);
        }).orElseThrow(() -> new RuntimeException("Location not found"));
    }
}
