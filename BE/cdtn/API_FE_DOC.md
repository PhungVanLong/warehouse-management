# API DOC CHUẨN CHO UI FRONTEND (FE)
port: http://localhost:8080

## 1. Đăng nhập (Login)
- **Endpoint:** `POST /api/auth/login`
  - Trường bắt buộc: `username`, `password`
- **Request body:**
  ```json
  {
    "username": "admin",
    "password": "your_password"
  }
  ```
- **Response thành công:**
  ```json
  {
    "success": true,
    "message": "Đăng nhập thành công",
    "data": {
      "id": 1,
      "usercode": "admin01",
      "fullname": "Admin hệ thống",
      "username": "admin",
      "email": "admin@example.com",
      "department": "KHO",
      "role": "ADMIN", // hoặc "STAFF"
      "isActive": true
    }
  }
  ```
- **Response thất bại (ví dụ):**
  ```json
  {
    "success": false,
    "message": "Sai tài khoản hoặc mật khẩu",
    "data": null
  }
  ```

---

## 2. Đăng ký tài khoản (Register)
- **Endpoint:** `POST /api/auth/register`
  - Trường bắt buộc: `usercode`, `fullname`, `username`, `email`, `password`, `department`
- **Request body:**
  ```json
  {
    "usercode": "admin01",
    "fullname": "Admin hệ thống",
    "username": "admin",
    "email": "admin@example.com",
    "password": "your_password",
    "department": "KHO"
  }
  ```
- **Response thành công:**
  ```json
  {
    "success": true,
    "message": "Đăng ký thành công",
    "data": null
  }
  ```
- **Response thất bại (ví dụ):**
  ```json
  {
    "success": false,
    "message": "Tài khoản đã tồn tại hoặc dữ liệu không hợp lệ",
    "data": null
  }
  ```

---

## 3. Quên mật khẩu (Forgot Password)
- **Endpoint:** `POST /api/auth/forgot-password`
  - Trường bắt buộc: `username`, `email`
- **Request body:**
  ```json
  {
    "username": "admin",
    "email": "admin@example.com"
  }
  ```
- **Response thành công:**
  ```json
  {
    "success": true,
    "message": "Xác nhận thành công, chuyển sang cập nhật mật khẩu mới",
    "data": null
  }
  ```
- **Response thất bại (ví dụ):**
  ```json
  {
    "success": false,
    "message": "Tài khoản hoặc email không đúng",
    "data": null
  }
  ```

---

## 4. Cập nhật mật khẩu mới (Update Password)
- **Endpoint:** `POST /api/auth/update-password`
  - Trường bắt buộc: `username`, `newPassword`
- **Request body:**
  ```json
  {
    "username": "admin",
    "newPassword": "your_new_password"
  }
  ```
- **Response thành công:**
  ```json
  {
    "success": true,
    "message": "Cập nhật mật khẩu thành công",
    "data": null
  }
  ```
- **Response thất bại (ví dụ):**
  ```json
  {
    "success": false,
    "message": "Tài khoản không hợp lệ hoặc lỗi cập nhật",
    "data": null
  }
  ```

---

## 5. Quy tắc chung khi gọi API
- Gửi/nhận dữ liệu dạng JSON.
- FE chỉ cần kiểm tra trường `success` để xác định thành công/thất bại, đọc `message` để hiển thị thông báo, lấy dữ liệu từ `data`.
- Khi gặp lỗi, FE cần hiển thị thông báo từ backend trả về.
- FE cần lưu thông tin user (id, role, token nếu có) sau khi đăng nhập thành công để xác thực các request tiếp theo (nếu backend có JWT/token).
- Tất cả các trường ngày giờ trả về đều theo chuẩn ISO 8601, ví dụ: `2024-04-01T10:00:00`.
- Validate dữ liệu đầu vào phía FE trước khi gửi request (không để trống các trường bắt buộc).

---

## 6. Các lưu ý cho UI/UX
- Hiển thị rõ lỗi đăng nhập, lỗi quên mật khẩu, lỗi đăng ký, lỗi cập nhật hàng hóa.
- Ẩn/hiện chức năng theo quyền (role).
- Validate dữ liệu đầu vào trước khi gửi request (không để trống các trường bắt buộc như username, password, itemcode, ...).

---

## 7. Danh mục hàng hóa (Item)
### Tạo mới hàng hóa
**Endpoint:** `POST /api/items`
  - **Yêu cầu xác thực:** Bắt buộc gửi token JWT trong header Authorization như các API khác.
  - **Request body:**
    ```json
    {
      "itemcode": "SP002",
      "barcode": "8938505970022",
      "itemname": "Sản phẩm B",
      "invoicename": "Sản phẩm B hóa đơn",
      "description": "Mô tả sản phẩm B",
      "itemtype": "Vật tư",
      "unitof": "Cái",
      "itemcatg": "Thiết bị",
      "minstocklevel": 5,
      "createdAt": "2026-04-12T10:00:00",
      "modifiedAt": null,
      "modifiedBy": "admin"
    }
    ```
  - **Response thành công:**
    ```json
    {
      "success": true,
      "message": "Tạo mới hàng hóa thành công",
      "data": {
        "id": 2,
        "itemcode": "SP002",
        "barcode": "8938505970022",
        "itemname": "Sản phẩm B",
        "invoicename": "Sản phẩm B hóa đơn",
        "description": "Mô tả sản phẩm B",
        "itemtype": "Vật tư",
        "unitof": "Cái",
        "itemcatg": "Thiết bị",
        "minstocklevel": 5,
        "createdAt": "2026-04-12T10:00:00",
        "modifiedAt": null,
        "modifiedBy": "admin"
      }
    }
    ```
  - **Response thất bại (ví dụ):**
    ```json
    {
      "success": false,
      "message": "Dữ liệu không hợp lệ hoặc lỗi hệ thống",
      "data": null
    }
    ```
### Lấy danh sách hàng hóa
**Endpoint:** `GET /api/items`
  - Hỗ trợ phân trang: Nếu có, truyền thêm query param `?page=1&size=20` (mặc định trả về toàn bộ nếu không truyền).
  - **Yêu cầu xác thực:** Bắt buộc gửi token JWT trong header Authorization.
  - **Cách lấy token:** Đăng nhập thành công sẽ nhận được trường `data.token` trong response. FE lưu lại token này để sử dụng cho các request tiếp theo.
  - **Ví dụ header:**
    ```
    Authorization: Bearer <token>
    ```
  - **Lưu ý:** Response trả về là danh sách DTO (ItemResponse), không trả entity trực tiếp. FE chỉ sử dụng các trường đã định nghĩa dưới đây.
**Response thành công:**
```json
{
  "success": true,
  "message": "Lấy danh sách hàng hóa thành công",
  "data": [
    {
      "id": 1,
      "itemcode": "SP001",
      "barcode": "8938505970012",
      "itemname": "Sản phẩm A",
      "invoicename": "Sản phẩm A hóa đơn",
      "description": "Mô tả sản phẩm A",
      "itemtype": "Vật tư",
      "unitof": "Cái",
      "itemcatg": "Thiết bị",
      "minstocklevel": 10,
      "createdAt": "2024-04-01T10:00:00",
      "modifiedAt": "2024-04-10T15:00:00",
      "modifiedBy": "admin"
    }
    // ...
  ]
}
```

### Xem chi tiết hàng hóa
**Endpoint:** `GET /api/items/{id}`
  - **Yêu cầu xác thực:** Bắt buộc gửi token JWT trong header Authorization như trên.
  - **Lưu ý:** Response trả về là DTO (ItemResponse), không trả entity trực tiếp. FE chỉ sử dụng các trường đã định nghĩa dưới đây.
**Response thành công:**
```json
{
  "success": true,
  "message": "Lấy chi tiết hàng hóa thành công",
  "data": {
    "id": 1,
    "itemcode": "SP001",
    "barcode": "8938505970012",
    "itemname": "Sản phẩm A",
    "invoicename": "Sản phẩm A hóa đơn",
    "description": "Mô tả sản phẩm A",
    "itemtype": "Vật tư",
    "unitof": "Cái",
    "itemcatg": "Thiết bị",
    "minstocklevel": 10,
    "createdAt": "2024-04-01T10:00:00",
    "modifiedAt": "2024-04-10T15:00:00",
    "modifiedBy": "admin"
  }
}
```
**Response thất bại (ví dụ):**
```json
{
  "success": false,
  "message": "Không tìm thấy hàng hóa",
  "data": null
}
```

### Cập nhật hàng hóa
**Endpoint:** `PUT /api/items/{id}`
  - Trường bắt buộc: `itemcode`, `itemname`, `modifiedBy`
  - **Yêu cầu xác thực:** Bắt buộc gửi token JWT trong header Authorization như trên.
**Request body:**
```json
{
  "itemcode": "SP001", // bắt buộc
  "barcode": "8938505970012",
  "itemname": "Sản phẩm A", // bắt buộc
  "invoicename": "Sản phẩm A hóa đơn",
  "description": "Mô tả sản phẩm A",
  "itemtype": "Vật tư",
  "unitof": "Cái",
  "itemcatg": "Thiết bị",
  "minstocklevel": 10,
  "modifiedBy": "admin" // bắt buộc
}
```
**Response thành công:**
```json
{
  "success": true,
  "message": "Cập nhật hàng hóa thành công",
  "data": {
    "id": 1,
    "itemcode": "SP001",
    "barcode": "8938505970012",
    "itemname": "Sản phẩm A",
    "invoicename": "Sản phẩm A hóa đơn",
    "description": "Mô tả sản phẩm A",
    "itemtype": "Vật tư",
    "unitof": "Cái",
    "itemcatg": "Thiết bị",
    "minstocklevel": 10,
    "createdAt": "2024-04-01T10:00:00",
    "modifiedAt": "2024-04-10T15:00:00",
    "modifiedBy": "admin"
  }
}
```
**Response thất bại (ví dụ):**
```json
{
  "success": false,
  "message": "Không tìm thấy hàng hóa hoặc dữ liệu không hợp lệ",
  "data": null
}
```

---

## 8. Phân quyền (Role)
  - `"STAFF"`: Nhân viên kho, quyền hạn giới hạn.
  - `"ADMIN"`: Quản trị viên, toàn quyền thao tác.
**FE cần kiểm tra trường này để hiển thị/ẩn chức năng phù hợp.**

---


