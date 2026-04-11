
# API DOC cho UI Frontend (FE)

## 1a. Tạo tài khoản (Đăng ký)
- **Endpoint:** `POST /api/auth/register`
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
  - HTTP 200, body: `true`
- **Response thất bại:**
  - HTTP 400, body: `"Tài khoản đã tồn tại hoặc dữ liệu không hợp lệ"`

## 1. Đăng nhập (Login)
- **Endpoint:** `POST /api/auth/login`
- **Request body:**
  ```json
  {
    "username": "QuanNM",
    "password": "your_password"
  }
  ```
- **Response thành công:**
  ```json
  {
    "id": 1,
    "usercode": "QuanNM",
    "fullname": "Nguyễn Minh Quân",
    "username": "QuanNM",
    "email": "quan.nm@gmail.com",
    "department": "KHO",
    "role": "ADMIN", // hoặc "STAFF"
    "isActive": true
  }
  ```
- **Response thất bại:**
  - HTTP 401, body: `"Sai tài khoản hoặc mật khẩu"`

---


## 2. Quên mật khẩu (Forgot Password)
  ```json
  {
    "username": "QuanNM",
    "email": "quan.nm@gmail.com"
  }
  ```
  - HTTP 200, body: `true` (FE chuyển sang màn hình cập nhật mật khẩu mới)
  - HTTP 404, body: `"Tài khoản hoặc email không đúng"`


## 3. Phân quyền (Role)
  - `"STAFF"`: Nhân viên kho, quyền hạn giới hạn.
- FE cần kiểm tra trường này để hiển thị/ẩn chức năng phù hợp.

---

## 4. Định dạng dữ liệu User (User object)
{
  "usercode": "QuanNM",
  "fullname": "Nguyễn Minh Quân",
  "username": "QuanNM",
  "email": "quan.nm@gmail.com",
  "department": "KHO",
  "role": "ADMIN",
  "isActive": true
}
```

---

## 5. Quy tắc chung khi gọi API
- Gửi/nhận dữ liệu dạng JSON.
- Khi gặp lỗi, FE cần hiển thị thông báo từ backend trả về.
- FE cần lưu thông tin user (id, role, token nếu có) sau khi đăng nhập thành công để xác thực các request tiếp theo (nếu backend có JWT/token).

---

## 6. Các lưu ý cho UI/UX
- Hiển thị rõ lỗi đăng nhập, lỗi quên mật khẩu.
- Ẩn/hiện chức năng theo quyền (role).
- Validate dữ liệu đầu vào trước khi gửi request (không để trống username, password...).

---

*Liên hệ backend nếu cần thêm API hoặc chi tiết nghiệp vụ khác.*
