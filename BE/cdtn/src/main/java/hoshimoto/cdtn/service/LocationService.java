package hoshimoto.cdtn.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import hoshimoto.cdtn.dto.LocationResponse;
import hoshimoto.cdtn.dto.request.LocationRequest;
import hoshimoto.cdtn.entity.Location;
import hoshimoto.cdtn.repository.ItemLocationRepository;
import hoshimoto.cdtn.repository.LocationRepository;

@Service
public class LocationService {
    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private ItemLocationRepository itemLocationRepository;

    public List<LocationResponse> getAllLocations() {
        return locationRepository.findAll().stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public Optional<LocationResponse> getLocationById(Long id) {
        return locationRepository.findById(id).map(this::toResponse);
    }

    public LocationResponse toResponse(Location l) {
        BigDecimal usedCapacity = itemLocationRepository.getTotalUsedCapacity(l.getId());
        return LocationResponse.fromEntity(l, usedCapacity);
    }

    public Location createLocation(LocationRequest request) {
        Location location = new Location();
        applyRequest(location, request);
        return locationRepository.save(location);
    }

    public Location updateLocation(Long id, LocationRequest request) {
        return locationRepository.findById(id).map(l -> {
            applyRequest(l, request);
            l.setModifiedAt(LocalDateTime.now());
            return locationRepository.save(l);
        }).orElseThrow(() -> new RuntimeException("Không tìm thấy vị trí với id: " + id));
    }

    public void deleteLocation(Long id) {
        locationRepository.findById(id).map(l -> {
            l.setIsActive(false);
            l.setModifiedAt(LocalDateTime.now());
            return locationRepository.save(l);
        }).orElseThrow(() -> new RuntimeException("Không tìm thấy vị trí với id: " + id));
    }

    private void applyRequest(Location l, LocationRequest request) {
        if (request.getLocationcode() != null) l.setLocationcode(request.getLocationcode());
        if (request.getLocationname() != null) l.setLocationname(request.getLocationname());
        if (request.getRackno() != null) l.setRackno(request.getRackno());
        if (request.getFloorno() != null) l.setFloorno(request.getFloorno());
        if (request.getColumnno() != null) l.setColumnno(request.getColumnno());
        if (request.getCapacity() != null) l.setCapacity(request.getCapacity());
        if (request.getDescription() != null) l.setDescription(request.getDescription());
        if (request.getIsActive() != null) l.setIsActive(request.getIsActive());
        if (request.getModifiedBy() != null) l.setModifiedBy(request.getModifiedBy());
    }
}
