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

---

## 12.x API lấy danh sách và chi tiết phiếu nhập kho (Goods Receipt)

### Lấy danh sách phiếu nhập
**Endpoint:** `GET /api/goods-receipts`
- Trả về danh sách tất cả phiếu nhập (order mới nhất lên đầu).
- Không cần truyền tham số nếu muốn lấy toàn bộ.

**Response thành công:**
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
      "details": [ /* Xem chi tiết bên dưới */ ]
    }
    // ...
  ]
}
```

### Lấy chi tiết phiếu nhập
**Endpoint:** `GET /api/goods-receipts/{id}`
- Trả về chi tiết 1 phiếu nhập theo id.

**Response thành công:**
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
      // ...
    ]
  }
}
```

---

## 13.x API lấy danh sách và chi tiết phiếu xuất kho (Goods Issue)

### Lấy danh sách phiếu xuất
**Endpoint:** `GET /api/goods-issues`
- Trả về danh sách tất cả phiếu xuất (order mới nhất lên đầu).
- Không cần truyền tham số nếu muốn lấy toàn bộ.

**Response thành công:**
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
      "createdAt": "2026-04-19T09:00:00",
      "details": [ /* Xem chi tiết bên dưới */ ]
    }
    // ...
  ]
}
```

### Lấy chi tiết phiếu xuất
**Endpoint:** `GET /api/goods-issues/{id}`
- Trả về chi tiết 1 phiếu xuất theo id.

**Response thành công:**
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
    "createdAt": "2026-04-19T09:00:00",
    "details": [
      {
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
      // ...
    ]
  }
}
```

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
        "usedCapacity": 0,
        "remainingCapacity": 100,
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
          "usedCapacity": 40,
          "remainingCapacity": 60,
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
        "usedCapacity": 40,
        "remainingCapacity": 60,
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
        "currentQuantity": 120,
        "availableSpace": 380,
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

> **Lưu ý về capacity:**
> - `currentQuantity` = **tổng số lượng TẤT CẢ mặt hàng** đang chiếm tại vị trí đó (không chỉ mặt hàng đang tìm).
> - `availableSpace` = `capacity - currentQuantity`.
> - Khi FE hiển thị, nên show thanh progress: `currentQuantity / capacity`.
> - Khi người dùng nhập số lượng vào dòng chi tiết, FE nên kiểm tra `quantity <= availableSpace` trước khi gửi.
> - Nếu xác nhận phiếu nhập (confirm) mà tổng vượt capacity, server sẽ trả về lỗi 400.

---

### 12.3b Gợi ý phân bổ nhiều vị trí nhập (suggest-split) *(dùng khi quantity > sức chứa 1 vị trí)*
**Endpoint:** `GET /api/goods-receipts/suggest-split?itemId={itemId}&quantity={quantity}`

BE tự động chia số lượng cần nhập qua nhiều vị trí: ưu tiên EXISTING (vị trí đang chứa cùng mặt hàng, còn chỗ), rồi EMPTY (trống hoàn toàn), cho đến khi đủ quantity.

  ```json
  {
    "success": true,
    "message": "Gợi ý phân bổ vị trí nhập thành công",
    "data": [
      {
        "locationId": 3,
        "locationcode": "A1-01",
        "locationname": "Kệ A1, tầng 1, cột 1",
        "capacity": 200,
        "currentQuantity": 50,
        "availableSpace": 150,
        "type": "EXISTING",
        "suggestedQuantity": 150
      },
      {
        "locationId": 7,
        "locationcode": "B2-03",
        "locationname": "Kệ B2, tầng 2, cột 3",
        "capacity": 200,
        "currentQuantity": 0,
        "availableSpace": 200,
        "type": "EMPTY",
        "suggestedQuantity": 200
      }
    ]
  }
  ```

> **Hướng dẫn sử dụng:**
> - FE gọi API này khi người dùng nhập quantity cho 1 mặt hàng và quantity đó có thể vượt sức chứa 1 vị trí.
> - Mỗi phần tử trả về là 1 dòng chi tiết gợi ý: FE map `locationId` + `suggestedQuantity` thành các dòng trong `details` của request tạo phiếu.
> - Nếu tổng sức chứa các vị trí không đủ, BE trả về `400` với thông báo lỗi.
> - `suggestedQuantity`: số lượng phân bổ vào vị trí đó, tổng các `suggestedQuantity` = `quantity` yêu cầu.

### 12.3c Liệt kê tất cả vị trí khả dụng để nhập (available-locations)
**Endpoint:** `GET /api/goods-receipts/available-locations?itemId={itemId}`

> **Thay đổi:** Không cần truyền `quantity`. BE liệt kê TẤT CẢ vị trí còn chỗ trống, ưu tiên vị trí đã có cùng mã hàng. FE tự quản lý việc chọn vị trí và tính tổng số lượng.

**Thứ tự ưu tiên:**
1. `EXISTING` – Vị trí đã có cùng mã hàng, còn chỗ trống *(ưu tiên 1)*
2. `EMPTY` – Vị trí hoàn toàn trống *(ưu tiên 2)*
3. `PARTIAL` – Vị trí có hàng khác, còn chỗ *(ưu tiên 3)*

**Response mẫu (LocationDetailResponse):**
```json
{
  "success": true,
  "message": "Liệt kê vị trí khả dụng để nhập kho thành công",
  "data": [
    {
      "locationId": 3,
      "locationcode": "A1-01",
      "locationname": "Kệ A1, tầng 1, cột 1",
      "rackno": "A1",
      "floorno": "1",
      "columnno": "1",
      "capacity": 500,
      "usedCapacity": 120,
      "remainingCapacity": 380,
      "type": "EXISTING",
      "items": [
        {
          "itemId": 5,
          "itemcode": "SP001",
          "itemname": "Sản phẩm A",
          "unitof": "Cái",
          "quantity": 100
        }
      ]
    },
    {
      "locationId": 7,
      "locationcode": "B2-03",
      "locationname": "Kệ B2, tầng 2, cột 3",
      "rackno": "B2",
      "floorno": "2",
      "columnno": "3",
      "capacity": 300,
      "usedCapacity": 0,
      "remainingCapacity": 300,
      "type": "EMPTY",
      "items": []
    },
    {
      "locationId": 9,
      "locationcode": "C3-02",
      "locationname": "Kệ C3, tầng 3, cột 2",
      "rackno": "C3",
      "floorno": "3",
      "columnno": "2",
      "capacity": 400,
      "usedCapacity": 200,
      "remainingCapacity": 200,
      "type": "PARTIAL",
      "items": [
        {
          "itemId": 8,
          "itemcode": "SP003",
          "itemname": "Sản phẩm C",
          "unitof": "Hộp",
          "quantity": 200
        }
      ]
    }
  ]
}
```

**Giải thích trường (LocationDetailResponse):**
| Trường | Kiểu | Mô tả |
|---|---|---|
| `locationId` | Long | ID vị trí |
| `locationcode` | String | Mã vị trí |
| `locationname` | String | Tên vị trí |
| `rackno` | String | Số kệ |
| `floorno` | String | Tầng |
| `columnno` | String | Cột |
| `capacity` | Integer | Sức chứa tối đa (null = không giới hạn) |
| `usedCapacity` | BigDecimal | Đã sử dụng (tổng tất cả hàng tại vị trí) |
| `remainingCapacity` | BigDecimal | Còn trống = capacity - usedCapacity |
| `type` | String | `EXISTING` / `EMPTY` / `PARTIAL` |
| `items` | Array | Danh sách hàng đang chứa tại vị trí |
| `items[].itemId` | Long | ID hàng hóa |
| `items[].itemcode` | String | Mã hàng hóa |
| `items[].itemname` | String | Tên hàng hóa |
| `items[].unitof` | String | Đơn vị tính |
| `items[].quantity` | BigDecimal | Số lượng đang chứa |

> **Lưu ý cho FE (nhập kho):**
> - Không cần truyền `quantity` trong query param.
> - FE cho người dùng chọn 1 hoặc nhiều vị trí, nhập số lượng vào từng vị trí.
> - FE nên kiểm tra `số lượng nhập <= remainingCapacity` trước khi tạo phiếu.
> - Nếu vượt capacity khi confirm, BE trả về lỗi 400.
### 12.4 Tạo phiếu nhập (DRAFT)
**Endpoint:** `POST /api/goods-receipts`

> FE gọi `GET /api/goods-receipts/available-locations?itemId=X` (mục 12.3c) để lấy danh sách vị trí, cho người dùng chọn `locationId` và nhập số lượng, rồi mới gửi request tạo phiếu.

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

### 13.3 Liệt kê tất cả vị trí có hàng để xuất (available-locations)
**Endpoint:** `GET /api/goods-issues/available-locations?itemId={itemId}`

> **Thay đổi:** Không cần truyền `quantity`. BE liệt kê TẤT CẢ vị trí đang chứa mã hàng `itemId` (bất kể số lượng tồn), sắp xếp theo tồn kho giảm dần. FE tự quản lý việc chọn vị trí và tính tổng số lượng có thể xuất.

**Response mẫu (LocationDetailResponse):**
```json
{
  "success": true,
  "message": "Liệt kê vị trí khả dụng để xuất kho thành công",
  "data": [
    {
      "locationId": 3,
      "locationcode": "A1-01",
      "locationname": "Kệ A1, tầng 1, cột 1",
      "rackno": "A1",
      "floorno": "1",
      "columnno": "1",
      "capacity": 500,
      "usedCapacity": 300,
      "remainingCapacity": 200,
      "type": "HAS_STOCK",
      "items": [
        {
          "itemId": 5,
          "itemcode": "SP001",
          "itemname": "Sản phẩm A",
          "unitof": "Cái",
          "quantity": 300
        }
      ]
    },
    {
      "locationId": 7,
      "locationcode": "B2-03",
      "locationname": "Kệ B2, tầng 2, cột 3",
      "rackno": "B2",
      "floorno": "2",
      "columnno": "3",
      "capacity": 200,
      "usedCapacity": 80,
      "remainingCapacity": 120,
      "type": "HAS_STOCK",
      "items": [
        {
          "itemId": 5,
          "itemcode": "SP001",
          "itemname": "Sản phẩm A",
          "unitof": "Cái",
          "quantity": 80
        }
      ]
    }
  ]
}
```

> **Lưu ý cho FE (xuất kho):**
> - Không cần truyền `quantity` trong query param.
> - Dữ liệu sắp xếp: vị trí có tồn kho **nhiều nhất** của mã hàng đó lên đầu.
> - FE cho người dùng chọn 1 hoặc nhiều vị trí, nhập số lượng xuất từng vị trí.
> - FE nên kiểm tra `số lượng xuất <= items[i].quantity (của mã hàng đó)` trước khi tạo phiếu.
> - Nếu tồn kho không đủ khi confirm, BE trả về lỗi 400.

---

### 13.3b Gợi ý phân bổ nhiều vị trí xuất (suggest-split) *(dùng khi quantity > tồn tại 1 vị trí)*
**Endpoint:** `GET /api/goods-issues/suggest-split?itemId={itemId}&quantity={quantity}`

BE tự động chia số lượng cần xuất qua nhiều vị trí, ưu tiên vị trí có tồn kho nhiều nhất trước.

- **Response thành công:**
  ```json
  {
    "success": true,
    "message": "Gợi ý phân bổ vị trí xuất thành công",
    "data": [
      {
        "locationId": 3,
        "locationcode": "A1-01",
        "locationname": "Kệ A1, tầng 1, cột 1",
        "capacity": 500,
        "currentQuantity": 300,
        "availableSpace": 300,
        "type": "HAS_STOCK",
        "suggestedQuantity": 300
      },
      {
        "locationId": 5,
        "locationcode": "A2-02",
        "locationname": "Kệ A2, tầng 2, cột 2",
        "capacity": 200,
        "currentQuantity": 200,
        "availableSpace": 200,
        "type": "HAS_STOCK",
        "suggestedQuantity": 200
      }
    ]
  }
  ```
- **Response thất bại (tổng tồn kho không đủ):**
  ```json
  {
    "success": false,
    "message": "Tồn kho tổng không đủ số lượng cần xuất 1000 (còn thiếu 500)",
    "data": null
  }
  ```

> **Hướng dẫn sử dụng:**
> - FE gọi API này khi người dùng nhập quantity cho 1 mặt hàng và tồn kho tại 1 vị trí có thể không đủ.
> - Mỗi phần tử trả về là 1 dòng chi tiết gợi ý: map `locationId` + `suggestedQuantity` thành các dòng trong `details` của request tạo phiếu.
> - `suggestedQuantity`: số lượng rút từ vị trí đó, tổng các `suggestedQuantity` = `quantity` yêu cầu.

---

### 13.4 Tạo phiếu xuất (DRAFT)
**Endpoint:** `POST /api/goods-issues`

> FE gọi `GET /api/goods-issues/available-locations?itemId=X` (mục 13.3) để lấy danh sách vị trí có hàng, cho người dùng chọn `locationId` và nhập số lượng xuất, rồi mới gửi request tạo phiếu.

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
2. Thêm từng dòng hàng: chọn `itemId`.
3. FE gọi `GET /api/goods-receipts/available-locations?itemId=X` → nhận danh sách **tất cả** vị trí còn chỗ, sắp xếp: vị trí **đã có cùng mã hàng** (`EXISTING`) lên đầu, tiếp đến trống (`EMPTY`), sau đó chứa hàng khác (`PARTIAL`).
4. Người dùng chọn 1 hoặc nhiều vị trí, nhập số lượng cho mỗi vị trí. FE kiểm tra `số lượng nhập <= remainingCapacity` trước khi tạo phiếu.
5. *(Tùy chọn)* Nếu muốn BE tự chia tự động: FE gọi `GET /api/goods-receipts/suggest-split?itemId=X&quantity=Y`. BE tự chia thành nhiều dòng gợi ý, FE map mỗi phần tử `{locationId, suggestedQuantity}` thành 1 dòng chi tiết riêng trong request.
6. FE gọi `POST /api/goods-receipts` với danh sách `details` → phiếu tạo trạng thái `DRAFT`.
7. Khi sẵn sàng: FE gọi `POST /api/goods-receipts/{id}/confirm`.

### Tạo phiếu xuất kho
1. Người dùng nhập header phiếu (docno, ngày, khách hàng, ghi chú).
2. Thêm từng dòng hàng: chọn `itemId`.
3. FE gọi `GET /api/goods-issues/available-locations?itemId=X` → nhận danh sách **tất cả** vị trí đang chứa mã hàng đó, sắp xếp theo tồn kho **giảm dần** (vị trí nhiều hàng nhất lên đầu).
4. Người dùng chọn 1 hoặc nhiều vị trí, nhập số lượng xuất từng vị trí. FE kiểm tra `số lượng xuất <= items[i].quantity (của mã hàng đó)`.
5. *(Tùy chọn)* Nếu muốn BE tự chia tự động: FE gọi `GET /api/goods-issues/suggest-split?itemId=X&quantity=Y`. BE tự chia thành nhiều dòng gợi ý, FE map mỗi phần tử `{locationId, suggestedQuantity}` thành 1 dòng chi tiết riêng.
6. FE gọi `POST /api/goods-issues` với danh sách `details` → phiếu tạo trạng thái `DRAFT`.
7. Khi sẵn sàng: FE gọi `POST /api/goods-issues/{id}/confirm`.

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


