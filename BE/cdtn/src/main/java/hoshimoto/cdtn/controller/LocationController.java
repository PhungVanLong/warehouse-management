package hoshimoto.cdtn.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import hoshimoto.cdtn.dto.ApiResponse;
import hoshimoto.cdtn.dto.LocationResponse;
import hoshimoto.cdtn.entity.Location;
import hoshimoto.cdtn.service.LocationService;

@RestController
@RequestMapping("/api/locations")
public class LocationController {
    @Autowired
    private LocationService locationService;


    @GetMapping
    public ResponseEntity<ApiResponse<List<LocationResponse>>> getAllLocations() {
        List<LocationResponse> list = locationService.getAllLocations().stream().map(LocationResponse::fromEntity).collect(Collectors.toList());
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách vị trí thành công", list));
    }


    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<LocationResponse>> getLocationById(@PathVariable Long id) {
        return locationService.getLocationById(id)
                .map(l -> ResponseEntity.ok(new ApiResponse<>(true, "Lấy chi tiết vị trí thành công", LocationResponse.fromEntity(l))))
                .orElseGet(() -> ResponseEntity.status(404).body(new ApiResponse<>(false, "Không tìm thấy vị trí", null)));
    }


    @PostMapping
    public ResponseEntity<ApiResponse<LocationResponse>> createLocation(@RequestBody LocationResponse request) {
        Location location = request.toEntity();
        Location created = locationService.createLocation(location);
        return ResponseEntity.ok(new ApiResponse<>(true, "Tạo mới vị trí thành công", LocationResponse.fromEntity(created)));
    }

    // Đã dùng LocationResponse.fromEntity và toEntity, không cần hàm mapping thủ công ở controller nữa
}
