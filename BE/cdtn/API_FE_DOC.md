# Lưu ý về các trường bắt buộc/ràng buộc

- Các trường **bắt buộc** khi tạo/sửa:
  - **Customer:** `customercode`, `customername`, `iscustomer` (ít nhất 1 trong issupplier/iscustomer phải true), `isActive`, `email` (nếu có dùng xác thực qua email)
  - **Item:** `itemcode`, `itemname`, `unitof`, `itemtype`, `isActive`
  - **Location:** `locationcode`, `locationname`, `isActive`
  - **User:** `usercode`, `fullname`, `username`, `password` (khi đăng ký/tạo mới), `role`, `isActive`
- Các trường **unique** (không trùng):
  - **Customer:** `customercode`, `email`
  - **Item:** `itemcode`, `barcode`
  - **Location:** `locationcode`
  - **User:** `usercode`, `username`, `email`
- Các trường **ràng buộc logic**:
  - **Customer:** Nếu `iscustomer=false` thì phải có `issupplier=true` và ngược lại.
  - **User:** `role` chỉ nhận giá trị `ADMIN` hoặc `STAFF`.
- Các trường ngày giờ (`createdAt`, `modifiedAt`, ...):
  - FE không cần gửi khi tạo mới, BE sẽ tự sinh.
  - Khi cập nhật, chỉ cần gửi `modifiedAt` nếu muốn lưu thời gian chỉnh sửa.
- Các trường **không bắt buộc** có thể để null hoặc bỏ qua khi gửi request.

**FE cần validate các trường bắt buộc trước khi gửi request!**

---

## 9. Danh mục đối tượng (Customer)
### Tạo mới đối tượng
**Endpoint:** `POST /api/customers`
  - **Yêu cầu xác thực:** Bắt buộc gửi token JWT trong header Authorization.
  - **Request body:**
    ```json
    {
      "customercode": "CUST001",
      "customername": "Công ty ABC",
      "address": "123 Đường A, Quận B, TP.C",
      "email": "abc@company.com",
      "mobile": "0901234567",
      "partnername": "Nguyễn Văn A",
      "partnermobile": "0912345678",
      "ownername": "Trần Thị B",
      "taxcode": "123456789",
      "itemcatg": "Khách hàng",
      "bankaccount": "1234567890",
      "bankname": "Vietcombank",
      "issupplier": false,
      "iscustomer": true,
      "createdAt": "2026-04-12T10:00:00",
      "modifiedAt": null,
      "modifiedBy": "admin",
      "isActive": true
    }
    ```
  - **Response thành công:**
    ```json
    {
      "success": true,
      "message": "Tạo mới đối tượng thành công",
      "data": {
        "id": 1,
        "customercode": "CUST001",
        "customername": "Công ty ABC",
        "address": "123 Đường A, Quận B, TP.C",
        "email": "abc@company.com",
        "mobile": "0901234567",
        "partnername": "Nguyễn Văn A",
        "partnermobile": "0912345678",
        "ownername": "Trần Thị B",
        "taxcode": "123456789",
        "itemcatg": "Khách hàng",
        "bankaccount": "1234567890",
        "bankname": "Vietcombank",
        "issupplier": false,
        "iscustomer": true,
        "createdAt": "2026-04-12T10:00:00",
        "modifiedAt": null,
        "modifiedBy": "admin",
        "isActive": true
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
### Lấy danh sách đối tượng
**Endpoint:** `GET /api/customers`
  - **Yêu cầu xác thực:** Bắt buộc gửi token JWT trong header Authorization.
  - **Response thành công:**
    ```json
    {
      "success": true,
      "message": "Lấy danh sách đối tượng thành công",
      "data": [
        {
          "id": 1,
          "customercode": "CUST001",
          "customername": "Công ty ABC",
          "address": "123 Đường A, Quận B, TP.C",
          "email": "abc@company.com",
          "mobile": "0901234567",
          "partnername": "Nguyễn Văn A",
          "partnermobile": "0912345678",
          "ownername": "Trần Thị B",
          "taxcode": "123456789",
          "itemcatg": "Khách hàng",
          "bankaccount": "1234567890",
          "bankname": "Vietcombank",
          "issupplier": false,
          "iscustomer": true,
          "createdAt": "2026-04-12T10:00:00",
          "modifiedAt": null,
          "modifiedBy": "admin",
          "isActive": true
        }
        // ...
      ]
    }
    ```
### Xem chi tiết đối tượng
**Endpoint:** `GET /api/customers/{id}`
  - **Yêu cầu xác thực:** Bắt buộc gửi token JWT trong header Authorization.
  - **Response thành công:**
    ```json
    {
      "success": true,
      "message": "Lấy chi tiết đối tượng thành công",
      "data": {
        "id": 1,
        "customercode": "CUST001",
        "customername": "Công ty ABC",
        "address": "123 Đường A, Quận B, TP.C",
        "email": "abc@company.com",
        "mobile": "0901234567",
        "partnername": "Nguyễn Văn A",
        "partnermobile": "0912345678",
        "ownername": "Trần Thị B",
        "taxcode": "123456789",
        "itemcatg": "Khách hàng",
        "bankaccount": "1234567890",
        "bankname": "Vietcombank",
        "issupplier": false,
        "iscustomer": true,
        "createdAt": "2026-04-12T10:00:00",
        "modifiedAt": null,
        "modifiedBy": "admin",
        "isActive": true
      }
    }
    ```
### Cập nhật đối tượng
**Endpoint:** `PUT /api/customers/{id}`
  - **Yêu cầu xác thực:** Bắt buộc gửi token JWT trong header Authorization.
  - **Request body:**
    ```json
    {
      "customercode": "CUST001",
      "customername": "Công ty ABC",
      "address": "123 Đường A, Quận B, TP.C",
      "email": "abc@company.com",
      "mobile": "0901234567",
      "partnername": "Nguyễn Văn A",
      "partnermobile": "0912345678",
      "ownername": "Trần Thị B",
      "taxcode": "123456789",
      "itemcatg": "Khách hàng",
      "bankaccount": "1234567890",
      "bankname": "Vietcombank",
      "issupplier": false,
      "iscustomer": true,
      "modifiedAt": "2026-04-12T12:00:00",
      "modifiedBy": "admin",
      "isActive": true
    }
    ```
  - **Response thành công:**
    ```json
    {
      "success": true,
      "message": "Cập nhật đối tượng thành công",
      "data": {
        "id": 1,
        "customercode": "CUST001",
        "customername": "Công ty ABC",
        "address": "123 Đường A, Quận B, TP.C",
        "email": "abc@company.com",
        "mobile": "0901234567",
        "partnername": "Nguyễn Văn A",
        "partnermobile": "0912345678",
        "ownername": "Trần Thị B",
        "taxcode": "123456789",
        "itemcatg": "Khách hàng",
        "bankaccount": "1234567890",
        "bankname": "Vietcombank",
        "issupplier": false,
        "iscustomer": true,
        "createdAt": "2026-04-12T10:00:00",
        "modifiedAt": "2026-04-12T12:00:00",
        "modifiedBy": "admin",
        "isActive": true
      }
    }
    ```
  - **Response thất bại (ví dụ):**
    ```json
    {
      "success": false,
      "message": "Không tìm thấy đối tượng hoặc dữ liệu không hợp lệ",
      "data": null
    }
    ```
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

## 10. Danh mục vị trí (Location)
### Tạo mới vị trí
**Endpoint:** `POST /api/locations`
  - **Yêu cầu xác thực:** Bắt buộc gửi token JWT trong header Authorization.
  - **Request body:**
    ```json
    {
      "locationcode": "A1-01",
      "locationname": "Kệ A1, tầng 1, cột 1",
      "rackno": "A1",
      "floorno": "1",
      "columnno": "1",
      "capacity": 100,
      "description": "Kệ tầng 1, sức chứa 100",
      "isActive": true,
      "createdAt": "2026-04-12T10:00:00",
      "modifiedAt": null,
      "modifiedBy": "admin"
    }
    ```
  - **Response thành công:**
    ```json
    {
      "success": true,
      "message": "Tạo mới vị trí thành công",
      "data": {
        "id": 1,
        "locationcode": "A1-01",
        "locationname": "Kệ A1, tầng 1, cột 1",
        "rackno": "A1",
        "floorno": "1",
        "columnno": "1",
        "capacity": 100,
        "description": "Kệ tầng 1, sức chứa 100",
        "isActive": true,
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
### Lấy danh sách vị trí
**Endpoint:** `GET /api/locations`
  - **Yêu cầu xác thực:** Bắt buộc gửi token JWT trong header Authorization.
  - **Response thành công:**
    ```json
    {
      "success": true,
      "message": "Lấy danh sách vị trí thành công",
      "data": [
        {
          "id": 1,
          "locationcode": "A1-01",
          "locationname": "Kệ A1, tầng 1, cột 1",
          "rackno": "A1",
          "floorno": "1",
          "columnno": "1",
          "capacity": 100,
          "description": "Kệ tầng 1, sức chứa 100",
          "isActive": true,
          "createdAt": "2026-04-12T10:00:00",
          "modifiedAt": null,
          "modifiedBy": "admin"
        }
        // ...
      ]
    }
    ```
### Xem chi tiết vị trí
**Endpoint:** `GET /api/locations/{id}`
  - **Yêu cầu xác thực:** Bắt buộc gửi token JWT trong header Authorization.
  - **Response thành công:**
    ```json
    {
      "success": true,
      "message": "Lấy chi tiết vị trí thành công",
      "data": {
        "id": 1,
        "locationcode": "A1-01",
        "locationname": "Kệ A1, tầng 1, cột 1",
        "rackno": "A1",
        "floorno": "1",
        "columnno": "1",
        "capacity": 100,
        "description": "Kệ tầng 1, sức chứa 100",
        "isActive": true,
        "createdAt": "2026-04-12T10:00:00",
        "modifiedAt": null,
        "modifiedBy": "admin"
      }
    }
    ```
### Cập nhật vị trí
**Endpoint:** `PUT /api/locations/{id}`
  - **Yêu cầu xác thực:** Bắt buộc gửi token JWT trong header Authorization.
  - **Request body:**
    ```json
    {
      "locationcode": "A1-01",
      "locationname": "Kệ A1, tầng 1, cột 1",
      "rackno": "A1",
      "floorno": "1",
      "columnno": "1",
      "capacity": 100,
      "description": "Kệ tầng 1, sức chứa 100",
      "isActive": true,
      "modifiedAt": "2026-04-12T12:00:00",
      "modifiedBy": "admin"
    }
    ```
  - **Response thành công:**
    ```json
    {
      "success": true,
      "message": "Cập nhật vị trí thành công",
      "data": {
        "id": 1,
        "locationcode": "A1-01",
        "locationname": "Kệ A1, tầng 1, cột 1",
        "rackno": "A1",
        "floorno": "1",
        "columnno": "1",
        "capacity": 100,
        "description": "Kệ tầng 1, sức chứa 100",
        "isActive": true,
        "createdAt": "2026-04-12T10:00:00",
        "modifiedAt": "2026-04-12T12:00:00",
        "modifiedBy": "admin"
      }
    }
    ```
  - **Response thất bại (ví dụ):**
    ```json
    {
      "success": false,
      "message": "Không tìm thấy vị trí hoặc dữ liệu không hợp lệ",
      "data": null
    }
    ```

---

## 12. Phiếu nhập kho (Goods Receipt)

> **Quyền truy cập:** ADMIN và STAFF đều thao tác được.
> **Luồng chuẩn:** Tạo phiếu DRAFT → (tuỳ chọn sửa) → Xác nhận → Tồn kho được cập nhật tự động.

### Trạng thái phiếu (`docstatus`)
| Giá trị | Ý nghĩa |
|---------|---------|
| `DRAFT` | Phiếu nháp, chưa ảnh hưởng tồn kho |
| `CONFIRMED` | Đã xác nhận, tồn kho đã được cộng |
| `CANCELLED` | Đã hủy |

---

### 12.1 Lấy danh sách phiếu nhập
**Endpoint:** `GET /api/goods-receipts`
- **Response thành công:**
  ```json
  {
    "success": true,
    "message": "Lấy danh sách phiếu nhập thành công",
    "data": [
      {
        "id": 1,
        "docno": "PN-2026-001",
        "docDate": "2026-04-19",
        "description": "Nhập hàng tháng 4",
        "docstatus": "DRAFT",
        "customerId": 2,
        "customerName": "Công ty ABC",
        "createdAt": "2026-04-19T09:00:00",
        "details": []
      }
    ]
  }
  ```

---

### 12.2 Xem chi tiết phiếu nhập
**Endpoint:** `GET /api/goods-receipts/{id}`
- **Response thành công:**
  ```json
  {
    "success": true,
    "message": "Lấy chi tiết phiếu nhập thành công",
    "data": {
      "id": 1,
      "docno": "PN-2026-001",
      "docDate": "2026-04-19",
      "description": "Nhập hàng tháng 4",
      "docstatus": "DRAFT",
      "customerId": 2,
      "customerName": "Công ty ABC",
      "createdAt": "2026-04-19T09:00:00",
      "details": [
        {
          "id": 1,
          "itemId": 5,
          "itemcode": "SP001",
          "itemname": "Sản phẩm A",
          "unitof": "Cái",
          "quantity": 100,
          "unitprice": 50000,
          "amount": 5000000,
          "locationId": 3,
          "locationcode": "A1-01",
          "locationname": "Kệ A1, tầng 1, cột 1"
        }
      ]
    }
  }
  ```

---

### 12.3 Gợi ý vị trí khi nhập hàng *(gọi trước khi tạo phiếu hoặc thêm dòng chi tiết)*
**Endpoint:** `GET /api/goods-receipts/suggest-locations?itemId={itemId}&quantity={quantity}`

**Ý nghĩa trường `type`:**
- `EXISTING` – Vị trí đang chứa cùng mã hàng, còn chỗ trống → **ưu tiên chọn trước**
- `EMPTY` – Vị trí hoàn toàn trống, đủ sức chứa

- **Response thành công:**
  ```json
  {
    "success": true,
    "message": "Gợi ý vị trí nhập kho thành công",
    "data": [
      {
        "locationId": 3,
        "locationcode": "A1-01",
        "locationname": "Kệ A1, tầng 1, cột 1",
        "capacity": 500,
        "currentQuantity": 100,
        "availableSpace": 400,
        "type": "EXISTING"
      },
      {
        "locationId": 7,
        "locationcode": "B2-03",
        "locationname": "Kệ B2, tầng 2, cột 3",
        "capacity": 300,
        "currentQuantity": 0,
        "availableSpace": 300,
        "type": "EMPTY"
      }
    ]
  }
  ```

---

### 12.4 Tạo phiếu nhập (DRAFT)
**Endpoint:** `POST /api/goods-receipts`

> FE cần gọi API gợi ý vị trí (12.3) cho từng dòng hàng, cho người dùng chọn `locationId`, rồi mới gửi request tạo phiếu.

- **Request body:**
  ```json
  {
    "docno": "PN-2026-001",
    "docDate": "2026-04-19",
    "description": "Nhập hàng tháng 4",
    "customerId": 2,
    "details": [
      {
        "itemId": 5,
        "locationId": 3,
        "quantity": 100,
        "unitprice": 50000
      }
    ]
  }
  ```
- **Response thành công:** Trả về object phiếu nhập đầy đủ (cấu trúc như mục 12.2).
- **Response thất bại (ví dụ):**
  ```json
  {
    "success": false,
    "message": "Mã phiếu 'PN-2026-001' đã tồn tại",
    "data": null
  }
  ```

---

### 12.5 Cập nhật phiếu nhập (chỉ DRAFT)
**Endpoint:** `PUT /api/goods-receipts/{id}`
- Request body giống 12.4. Toàn bộ dòng chi tiết cũ sẽ bị thay thế bởi danh sách mới.
- Chỉ thao tác được khi `docstatus = DRAFT`.

---

### 12.6 Xác nhận phiếu nhập
**Endpoint:** `POST /api/goods-receipts/{id}/confirm`
- Không cần request body.
- BE sẽ: cộng số lượng vào `ItemLocation` (vị trí đã chọn trong chi tiết) và `InventoryBalance`.
- **Lưu ý:** Mọi dòng chi tiết phải có `locationId`, nếu thiếu BE trả lỗi.
- **Response thành công:**
  ```json
  {
    "success": true,
    "message": "Xác nhận phiếu nhập thành công",
    "data": { "...": "object phiếu nhập với docstatus = CONFIRMED" }
  }
  ```

---

### 12.7 Hủy phiếu nhập
**Endpoint:** `POST /api/goods-receipts/{id}/cancel`
- Không cần request body. Chỉ hủy được khi `docstatus = DRAFT`.

---

## 13. Phiếu xuất kho (Goods Issue)

> **Quyền truy cập:** ADMIN và STAFF đều thao tác được.
> **Luồng chuẩn:** Tạo phiếu DRAFT → (tuỳ chọn sửa) → Xác nhận → Tồn kho bị trừ tự động.

### Trạng thái phiếu (`docstatus`)
Giống mục 12 (DRAFT / CONFIRMED / CANCELLED).

---

### 13.1 Lấy danh sách phiếu xuất
**Endpoint:** `GET /api/goods-issues`
- **Response thành công:**
  ```json
  {
    "success": true,
    "message": "Lấy danh sách phiếu xuất thành công",
    "data": [
      {
        "id": 1,
        "docno": "PX-2026-001",
        "docDate": "2026-04-19",
        "description": "Xuất hàng đơn đặt hàng #123",
        "docstatus": "DRAFT",
        "customerId": 3,
        "customerName": "Công ty XYZ",
        "createdAt": "2026-04-19T10:00:00",
        "details": []
      }
    ]
  }
  ```

---

### 13.2 Xem chi tiết phiếu xuất
**Endpoint:** `GET /api/goods-issues/{id}`
- **Response thành công:**
  ```json
  {
    "success": true,
    "message": "Lấy chi tiết phiếu xuất thành công",
    "data": {
      "id": 1,
      "docno": "PX-2026-001",
      "docDate": "2026-04-19",
      "description": "Xuất hàng đơn đặt hàng #123",
      "docstatus": "DRAFT",
      "customerId": 3,
      "customerName": "Công ty XYZ",
      "createdAt": "2026-04-19T10:00:00",
      "details": [
        {
          "id": 1,
          "itemId": 5,
          "itemcode": "SP001",
          "itemname": "Sản phẩm A",
          "unitof": "Cái",
          "quantity": 20,
          "unitprice": 55000,
          "amount": 1100000,
          "locationId": 3,
          "locationcode": "A1-01",
          "locationname": "Kệ A1, tầng 1, cột 1"
        }
      ]
    }
  }
  ```

---

### 13.3 Lấy danh sách vị trí có hàng để xuất *(gọi trước khi tạo phiếu hoặc thêm dòng chi tiết)*
**Endpoint:** `GET /api/goods-issues/available-locations?itemId={itemId}&quantity={quantity}`

Trả về các vị trí đang chứa `itemId` với tồn kho tại vị trí đó `>= quantity`.

- **Response thành công:**
  ```json
  {
    "success": true,
    "message": "Lấy danh sách vị trí xuất kho thành công",
    "data": [
      {
        "locationId": 3,
        "locationcode": "A1-01",
        "locationname": "Kệ A1, tầng 1, cột 1",
        "capacity": 500,
        "currentQuantity": 100,
        "availableSpace": 100,
        "type": "HAS_STOCK"
      }
    ]
  }
  ```

---

### 13.4 Tạo phiếu xuất (DRAFT)
**Endpoint:** `POST /api/goods-issues`

> FE cần gọi API vị trí có hàng (13.3) cho từng dòng hàng, cho người dùng chọn `locationId`, rồi mới gửi request tạo phiếu.

- **Request body:**
  ```json
  {
    "docno": "PX-2026-001",
    "docDate": "2026-04-19",
    "description": "Xuất hàng đơn đặt hàng #123",
    "customerId": 3,
    "details": [
      {
        "itemId": 5,
        "locationId": 3,
        "quantity": 20,
        "unitprice": 55000
      }
    ]
  }
  ```
- **Response thành công:** Trả về object phiếu xuất đầy đủ (cấu trúc như mục 13.2).
- **Response thất bại (ví dụ):**
  ```json
  {
    "success": false,
    "message": "Mã phiếu 'PX-2026-001' đã tồn tại",
    "data": null
  }
  ```

---

### 13.5 Cập nhật phiếu xuất (chỉ DRAFT)
**Endpoint:** `PUT /api/goods-issues/{id}`
- Request body giống 13.4. Toàn bộ dòng chi tiết cũ sẽ bị thay thế bởi danh sách mới.
- Chỉ thao tác được khi `docstatus = DRAFT`.

---

### 13.6 Xác nhận phiếu xuất
**Endpoint:** `POST /api/goods-issues/{id}/confirm`
- Không cần request body.
- BE sẽ: kiểm tra tồn kho tại từng vị trí, rồi trừ số lượng khỏi `ItemLocation` và `InventoryBalance`.
- **Lưu ý lỗi BE có thể trả về:**
  - Dòng chi tiết thiếu `locationId`
  - Tồn kho tại vị trí không đủ số lượng cần xuất
- **Response thành công:**
  ```json
  {
    "success": true,
    "message": "Xác nhận phiếu xuất thành công",
    "data": { "...": "object phiếu xuất với docstatus = CONFIRMED" }
  }
  ```

---

### 13.7 Hủy phiếu xuất
**Endpoint:** `POST /api/goods-issues/{id}/cancel`
- Không cần request body. Chỉ hủy được khi `docstatus = DRAFT`.

---

## 14. Luồng thao tác FE đề xuất

### Tạo phiếu nhập kho
1. Người dùng nhập header phiếu (docno, ngày, khách hàng, ghi chú).
2. Thêm từng dòng hàng: chọn `itemId` + nhập `quantity`.
3. FE gọi `GET /api/goods-receipts/suggest-locations?itemId=X&quantity=Y` → hiển thị dropdown gợi ý vị trí.
4. Người dùng chọn vị trí cho từng dòng.
5. FE gọi `POST /api/goods-receipts` → phiếu tạo trạng thái `DRAFT`.
6. Khi sẵn sàng: FE gọi `POST /api/goods-receipts/{id}/confirm`.

### Tạo phiếu xuất kho
1. Người dùng nhập header phiếu (docno, ngày, khách hàng, ghi chú).
2. Thêm từng dòng hàng: chọn `itemId` + nhập `quantity`.
3. FE gọi `GET /api/goods-issues/available-locations?itemId=X&quantity=Y` → hiển thị dropdown vị trí có hàng.
4. Người dùng chọn vị trí cho từng dòng.
5. FE gọi `POST /api/goods-issues` → phiếu tạo trạng thái `DRAFT`.
6. Khi sẵn sàng: FE gọi `POST /api/goods-issues/{id}/confirm`.

---

## 11. Danh mục nhân viên (User)
### Tạo mới nhân viên
**Endpoint:** `POST /api/users`
  - **Yêu cầu xác thực:** Chỉ ADMIN được phép tạo mới. Gửi token JWT trong header Authorization.
  - **Request body:**
    ```json
    {
      "usercode": "NV001",
      "fullname": "Nguyễn Văn An",
      "username": "annv",
      "email": "annguyenvan@gmail.com",
      "department": "Kho",
      "phoneNumber": "0985448206",
      "address": "Quận Hai Bà Trưng, Hà Nội",
      "birthdate": "1999-01-20T00:00:00",
      "gender": "Nam",
      "firstworkingdate": "2024-01-01T00:00:00",
      "bankaccount": "0985448206",
      "bankname": "Vietcombank",
      "isActive": true,
      "role": "STAFF"
    }
    ```
  - **Response thành công:**
    ```json
    {
      "success": true,
      "message": "Tạo mới nhân viên thành công",
      "data": {
        "id": 1,
        "usercode": "NV001",
        "fullname": "Nguyễn Văn An",
        "username": "annv",
        "email": "annguyenvan@gmail.com",
        "department": "Kho",
        "phoneNumber": "0985448206",
        "address": "Quận Hai Bà Trưng, Hà Nội",
        "birthdate": "1999-01-20T00:00:00",
        "gender": "Nam",
        "firstworkingdate": "2024-01-01T00:00:00",
        "bankaccount": "0985448206",
        "bankname": "Vietcombank",
        "isActive": true,
        "role": "STAFF"
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
### Lấy danh sách nhân viên
**Endpoint:** `GET /api/users`
  - **Yêu cầu xác thực:** ADMIN và STAFF đều xem được. Gửi token JWT trong header Authorization.
  - **Response thành công:**
    ```json
    {
      "success": true,
      "message": "Lấy danh sách nhân viên thành công",
      "data": [
        {
          "id": 1,
          "usercode": "NV001",
          "fullname": "Nguyễn Văn An",
          "username": "annv",
          "email": "annguyenvan@gmail.com",
          "department": "Kho",
          "phoneNumber": "0985448206",
          "address": "Quận Hai Bà Trưng, Hà Nội",
          "birthdate": "1999-01-20T00:00:00",
          "gender": "Nam",
          "firstworkingdate": "2024-01-01T00:00:00",
          "bankaccount": "0985448206",
          "bankname": "Vietcombank",
          "isActive": true,
          "role": "STAFF"
        }
        // ...
      ]
    }
    ```
### Xem chi tiết nhân viên
**Endpoint:** `GET /api/users/{id}`
  - **Yêu cầu xác thực:** Chỉ ADMIN được phép xem chi tiết. Gửi token JWT trong header Authorization.
  - **Response thành công:**
    ```json
    {
      "success": true,
      "message": "Lấy chi tiết nhân viên thành công",
      "data": {
        "id": 1,
        "usercode": "NV001",
        "fullname": "Nguyễn Văn An",
        "username": "annv",
        "email": "annguyenvan@gmail.com",
        "department": "Kho",
        "phoneNumber": "0985448206",
        "address": "Quận Hai Bà Trưng, Hà Nội",
        "birthdate": "1999-01-20T00:00:00",
        "gender": "Nam",
        "firstworkingdate": "2024-01-01T00:00:00",
        "bankaccount": "0985448206",
        "bankname": "Vietcombank",
        "isActive": true,
        "role": "STAFF"
      }
    }
    ```
### Cập nhật nhân viên
**Endpoint:** `PUT /api/users/{id}`
  - **Yêu cầu xác thực:** Chỉ ADMIN được phép cập nhật. Gửi token JWT trong header Authorization.
  - **Request body:**
    ```json
    {
      "usercode": "NV001",
      "fullname": "Nguyễn Văn An",
      "username": "annv",
      "email": "annguyenvan@gmail.com",
      "department": "Kho",
      "phoneNumber": "0985448206",
      "address": "Quận Hai Bà Trưng, Hà Nội",
      "birthdate": "1999-01-20T00:00:00",
      "gender": "Nam",
      "firstworkingdate": "2024-01-01T00:00:00",
      "bankaccount": "0985448206",
      "bankname": "Vietcombank",
      "isActive": true,
      "role": "STAFF"
    }
    ```
  - **Response thành công:**
    ```json
    {
      "success": true,
      "message": "Cập nhật nhân viên thành công",
      "data": {
        "id": 1,
        "usercode": "NV001",
        "fullname": "Nguyễn Văn An",
        "username": "annv",
        "email": "annguyenvan@gmail.com",
        "department": "Kho",
        "phoneNumber": "0985448206",
        "address": "Quận Hai Bà Trưng, Hà Nội",
        "birthdate": "1999-01-20T00:00:00",
        "gender": "Nam",
        "firstworkingdate": "2024-01-01T00:00:00",
        "bankaccount": "0985448206",
        "bankname": "Vietcombank",
        "isActive": true,
        "role": "STAFF"
      }
    }
    ```
  - **Response thất bại (ví dụ):**
    ```json
    {
      "success": false,
      "message": "Không tìm thấy nhân viên hoặc dữ liệu không hợp lệ",
      "data": null
    }
    ```


