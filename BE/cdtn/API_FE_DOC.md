# API FE DOC CHUẨN

> Base URL: `http://localhost:8080`

## Tổng quan

- Dữ liệu gửi/nhận dạng JSON.
- FE cần kiểm tra các trường bắt buộc trước khi gửi.
- Các trường thời gian (`createdAt`, `modifiedAt`) thường do BE sinh tự động.
- Tất cả API yêu cầu JWT token trong header `Authorization: Bearer <token>` trừ các endpoint auth.
- Cấu trúc response chung:
```json
{
  "success": true,
  "message": "Thông báo",
  "data": {}
}
```

---

## Mục lục

1. [Ràng buộc chung](#1-ràng-buộc-chung)
2. [Authentication](#2-authentication)
3. [User](#3-user)
4. [Customer](#4-customer)
5. [Item](#5-item)
6. [Location](#6-location)
7. [Goods Receipt – Nhập kho](#7-goods-receipt--nhập-kho)
8. [Goods Issue – Xuất kho](#8-goods-issue--xuất-kho)
9. [Inventory Audit – Kiểm kê](#9-inventory-audit--kiểm-kê)
10. [Batch – Lô hàng](#10-batch--lô-hàng)
11. [Lưu ý chung cho FE](#11-lưu-ý-chung-cho-fe)

---

## 1. Ràng buộc chung

### Trường bắt buộc khi tạo/sửa

| Module | Bắt buộc |
|--------|----------|
| Customer | `customercode`, `customername`, ít nhất 1 trong `issupplier` / `iscustomer` phải `true` |
| Item | `itemcode`, `itemname`, `unitof`, `itemtype`, `isActive` |
| Location | `locationcode`, `locationname`, `isActive` |
| User | `usercode`, `fullname`, `username`, `password` (khi tạo mới), `role`, `isActive` |
| GoodsReceipt | `docno`, mỗi detail cần `itemId`, `quantity` |
| GoodsIssue | `docno`, mỗi detail cần `itemId`, `quantity`, `locationId` |
| InventoryAudit | `docno`, `locationId`, mỗi detail cần `itemId`, `actualquantity` |
| Batch | `itemId`, `nameBatch`, `receiptDetailId`, `unitCost`, `quantity` |

### Unique

- Customer: `customercode`, `email`
- Item: `itemcode`, `barcode`
- Location: `locationcode`
- User: `usercode`, `username`, `email`
- GoodsReceipt / GoodsIssue / InventoryAudit: `docno`
- Batch: `batchCode` (BE tự sinh, FE không gửi)

### Ràng buộc logic

- Customer: nếu `iscustomer=false` thì phải có `issupplier=true`, và ngược lại.
- User: `role` chỉ nhận `ADMIN`, `MANAGER` hoặc `STAFF`. Quy tắc tạo: **ADMIN** có thể tạo `MANAGER` hoặc `STAFF` (không tạo được `ADMIN`); **MANAGER** chỉ tạo được `STAFF`.
- Phiếu nhập/xuất/kiểm kê: chỉ `DRAFT` mới được sửa hoặc hủy khi chưa gửi/đã xác nhận; không thể sửa sau khi `CONFIRMED` hoặc `CANCELLED`.
- Quy trình kiểm kê (mới): Manager có thể **gán** phiếu cho một `STAFF` (gửi yêu cầu) — phiếu chuyển sang `REQUESTED`. `STAFF` nhận yêu cầu, cập nhật số lượng thực tế và **gửi** lại (`SUBMITTED`). Manager kiểm tra và `confirm` để áp điều chỉnh tồn kho (chuyển `CONFIRMED`) hoặc `cancel`.
- Trạng thái phiếu (`docstatus`) (mở rộng): `DRAFT` → `REQUESTED` → `SUBMITTED` → `CONFIRMED` or `CANCELLED` (Manager có thể confirm trực tiếp từ `DRAFT` hoặc từ `SUBMITTED`).

### Ngày giờ

- FE không cần gửi `createdAt`, `batchCode`, `quantityRemaining`; BE tự sinh.
- Định dạng ngày: `yyyy-MM-dd` (ví dụ: `"2026-05-05"`).
- Định dạng datetime: ISO 8601 (ví dụ: `"2026-05-05T08:30:00"`).

---

## 2. Authentication

### 2.1 Đăng nhập

**Endpoint:** `POST /api/auth/login`

**Request body:**
```json
{
  "username": "admin",
  "password": "your_password"
}
```

**Response thành công:**
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "id": 1,
    "usercode": "admin01",
    "fullname": "Admin hệ thống",
    "username": "admin",
    "email": "admin@example.com",
    "department": "KHO",
    "role": "ADMIN",
    "isActive": true
  }
}
```

> FE lưu `token` vào localStorage/sessionStorage và gửi kèm header `Authorization: Bearer <token>` với mọi request tiếp theo. Token chứa `role` của người dùng — nếu nhận 403 sau khi server cập nhật, **xóa token cũ và đăng nhập lại** để lấy token mới.

---

### 2.2 Đăng ký

**Endpoint:** `POST /api/auth/register`

**Request body:**
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

---

### 2.3 Quên mật khẩu

**Endpoint:** `POST /api/auth/forgot-password`

**Request body:**
```json
{
  "username": "admin",
  "email": "admin@example.com"
}
```

---

### 2.4 Cập nhật mật khẩu mới

**Endpoint:** `POST /api/auth/update-password`

**Request body:**
```json
{
  "username": "admin",
  "newPassword": "your_new_password"
}
```

---

## 3. User

| Method | Endpoint | Mô tả | Quyền |
|--------|----------|-------|-------|
| GET | `/api/users` | Danh sách người dùng | ADMIN, MANAGER, STAFF |
| GET | `/api/users/{id}` | Chi tiết người dùng | ADMIN, MANAGER |
| POST | `/api/users` | Tạo người dùng | ADMIN, MANAGER |
| PUT | `/api/users/{id}` | Cập nhật người dùng | ADMIN, MANAGER |
| DELETE | `/api/users/{id}` | Vô hiệu hóa người dùng | ADMIN, MANAGER |

### Quy tắc phân quyền tạo / sửa / xóa tài khoản

> **QUAN TRỌNG — FE cần ẩn/hiện trường `role` và validate trước khi gửi request.**

#### Tạo tài khoản (`POST /api/users`)

| Người thực hiện | `role` được phép gửi | Ghi chú |
|-----------------|----------------------|---------|
| **ADMIN** | `MANAGER`, `STAFF` | Không được tạo tài khoản `ADMIN` khác |
| **MANAGER** | `STAFF` | Chỉ tạo được nhân viên cấp dưới |

- Nếu FE gửi sai `role` (vd. MANAGER gửi `role: "MANAGER"`), BE trả về `400` với message `"MANAGER chỉ được tạo tài khoản STAFF"`.
- Nếu ADMIN gửi `role: "ADMIN"`, BE trả về `400` với message `"Không thể tạo tài khoản ADMIN"`.

#### Cập nhật tài khoản (`PUT /api/users/{id}`)

| Người thực hiện | Được sửa tài khoản nào | `role` được phép thay đổi thành |
|-----------------|------------------------|----------------------------------|
| **ADMIN** | Bất kỳ | `MANAGER`, `STAFF` (không đổi thành `ADMIN`) |
| **MANAGER** | Chỉ tài khoản `STAFF` | Chỉ `STAFF` |

- MANAGER **không** được sửa tài khoản có role `MANAGER` hoặc `ADMIN` → BE trả `400`.
- MANAGER **không** được nâng role lên `MANAGER`/`ADMIN` → BE trả `400`.

#### Vô hiệu hóa tài khoản (`DELETE /api/users/{id}`)

| Người thực hiện | Được vô hiệu hóa tài khoản nào |
|-----------------|----------------------------------|
| **ADMIN** | Bất kỳ |
| **MANAGER** | Chỉ tài khoản `STAFF` |

- MANAGER cố vô hiệu hóa tài khoản `MANAGER`/`ADMIN` → BE trả `400`.
- Đây là **soft delete** (`isActive = false`), tài khoản không bị xóa khỏi DB.

### 3.1 Tạo người dùng

**Endpoint:** `POST /api/users`  
**Header:** `Authorization: Bearer <token>`

**Request body:**
```json
{
  "usercode": "staff01",
  "fullname": "Nhân viên kho",
  "username": "staff01",
  "email": "staff01@company.com",
  "password": "your_password",
  "department": "KHO",
  "phoneNumber": "0901234567",
  "address": "123 Đường A",
  "gender": "Nam",
  "bankaccount": "1234567890",
  "bankname": "Vietcombank",
  "role": "STAFF",
  "isActive": true
}
```

> - `password`: bắt buộc khi tạo mới, tùy chọn khi cập nhật.
> - `role`: FE chỉ hiển thị các lựa chọn phù hợp với quyền của người dùng hiện tại (ADMIN thấy `MANAGER`/`STAFF`; MANAGER chỉ thấy `STAFF`).
> - `usercode`, `username`, `email` phải unique trong hệ thống.

**Response thành công (`200`):**
```json
{
  "success": true,
  "message": "Tạo mới nhân viên thành công",
  "data": {
    "id": 5,
    "usercode": "staff01",
    "fullname": "Nhân viên kho",
    "username": "staff01",
    "email": "staff01@company.com",
    "department": "KHO",
    "role": "STAFF",
    "isActive": true
  }
}
```

**Response lỗi phân quyền (`400`):**
```json
{
  "success": false,
  "message": "MANAGER chỉ được tạo tài khoản STAFF",
  "data": null
}
```

### 3.2 Cập nhật người dùng

**Endpoint:** `PUT /api/users/{id}`  
**Header:** `Authorization: Bearer <token>`

> Gửi chỉ các trường cần cập nhật. Bỏ qua `password` nếu không đổi mật khẩu.

**Request body (ví dụ):**
```json
{
  "fullname": "Nhân viên kho mới",
  "department": "KHO2",
  "isActive": true
}
```

### 3.3 Vô hiệu hóa người dùng

**Endpoint:** `DELETE /api/users/{id}`  
**Header:** `Authorization: Bearer <token>`

> Không xóa thật — chỉ set `isActive = false`.

**Response thành công:**
```json
{
  "success": true,
  "message": "Vô hiệu hóa nhân viên thành công",
  "data": null
}
```

---

## 4. Customer

| Method | Endpoint | Mô tả | Quyền |
|--------|----------|-------|-------|
| GET | `/api/customers` | Danh sách khách hàng | ADMIN, MANAGER, STAFF |
| GET | `/api/customers/{id}` | Chi tiết khách hàng | ADMIN, MANAGER, STAFF |
| POST | `/api/customers` | Tạo mới | ADMIN, MANAGER, STAFF |
| PUT | `/api/customers/{id}` | Cập nhật | ADMIN, MANAGER, STAFF |
| DELETE | `/api/customers/{id}` | Xóa | ADMIN, MANAGER |

**Request body:**
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
  "isActive": true
}
```

---

## 5. Item

| Method | Endpoint | Mô tả | Quyền |
|--------|----------|-------|-------|
| GET | `/api/items` | Danh sách hàng hóa | ADMIN, MANAGER, STAFF |
| GET | `/api/items/{id}` | Chi tiết hàng hóa | ADMIN, MANAGER, STAFF |
| POST | `/api/items` | Tạo mới | ADMIN, MANAGER, STAFF |
| PUT | `/api/items/{id}` | Cập nhật | ADMIN, MANAGER, STAFF |
| DELETE | `/api/items/{id}` | Xóa | ADMIN, MANAGER |

**Request body:**
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
  "isActive": true
}
```

---

## 6. Location

| Method | Endpoint | Mô tả | Quyền |
|--------|----------|-------|-------|
| GET | `/api/locations` | Danh sách vị trí | ADMIN, MANAGER, STAFF |
| GET | `/api/locations/{id}` | Chi tiết vị trí | ADMIN, MANAGER, STAFF |
| GET | `/api/locations/{id}/items` | Vị trí + danh sách hàng hóa đang chứa | ADMIN, MANAGER, STAFF |
| POST | `/api/locations` | Tạo mới | ADMIN, MANAGER, STAFF |
| PUT | `/api/locations/{id}` | Cập nhật | ADMIN, MANAGER, STAFF |
| DELETE | `/api/locations/{id}` | Xóa | ADMIN, MANAGER |

**Request body:**
```json
{
  "locationcode": "A1-01",
  "locationname": "Kệ A1, tầng 1, cột 1",
  "rackno": "A1",
  "floorno": "1",
  "columnno": "1",
  "capacity": 100,
  "description": "Kệ tầng 1, sức chứa 100",
  "isActive": true
}
```

> `capacity = null`: vị trí không giới hạn sức chứa.

### 6.1 Chi tiết vị trí kèm danh sách hàng hóa

**Endpoint:** `GET /api/locations/{id}/items`

**Response:**
```json
{
  "success": true,
  "message": "Lấy danh sách hàng hóa tại vị trí thành công",
  "data": {
    "locationId": 3,
    "locationcode": "A1-01",
    "locationname": "Kệ A1, tầng 1, cột 1",
    "rackno": "A1",
    "floorno": "1",
    "columnno": "1",
    "capacity": 100,
    "usedCapacity": 40,
    "remainingCapacity": 60,
    "type": "HAS_STOCK",
    "items": [
      {
        "itemId": 5,
        "itemcode": "SP001",
        "itemname": "Sản phẩm A",
        "unitof": "Cái",
        "quantity": 40,
        "batchCodes": ["LO-HANG-A-20260415-SP001"]
      }
    ]
  }
}
```

> `type`: `"HAS_STOCK"` nếu vị trí đang chứa hàng, `"EMPTY"` nếu trống hoàn toàn.  
> `items`: danh sách hàng hóa đang chứa tại vị trí (chỉ các bản ghi `isActive = true`).  
> `remainingCapacity`: `null` nếu vị trí không giới hạn sức chứa (`capacity = null`).

---

## 7. Goods Receipt – Nhập kho

**Base path:** `/api/goods-receipts`

**Luồng:** `DRAFT` → *(chỉnh sửa tùy ý)* → `confirm` → tồn kho được cộng  
*(hoặc)* → `cancel` → phiếu bị hủy (tồn kho không đổi)

| Method | Endpoint | Mô tả | Quyền |
|--------|----------|-------|-------|
| GET | `/api/goods-receipts` | Danh sách phiếu nhập | ADMIN, MANAGER, STAFF |
| GET | `/api/goods-receipts/{id}` | Chi tiết phiếu nhập | ADMIN, MANAGER, STAFF |
| POST | `/api/goods-receipts` | Tạo phiếu nháp | ADMIN, MANAGER, STAFF |
| PUT | `/api/goods-receipts/{id}` | Sửa phiếu DRAFT | ADMIN, MANAGER, STAFF |
| POST | `/api/goods-receipts/{id}/confirm` | Xác nhận → cộng tồn | ADMIN, MANAGER |
| POST | `/api/goods-receipts/{id}/cancel` | Hủy phiếu DRAFT | ADMIN, MANAGER |
| GET | `/api/goods-receipts/available-locations?itemId=` | Vị trí còn chỗ | ADMIN, MANAGER, STAFF |
| GET | `/api/goods-receipts/suggest-locations?itemId=&quantity=` | Gợi ý vị trí | ADMIN, MANAGER, STAFF |
| GET | `/api/goods-receipts/suggest-split?itemId=&quantity=` | Gợi ý phân bổ nhiều vị trí | ADMIN, MANAGER, STAFF |

### 7.1 Tạo / Cập nhật phiếu nhập (DRAFT)

**Request body:**
```json
{
  "docno": "PN-2026-001",
  "docDate": "2026-05-05",
  "description": "Nhập hàng tháng 5",
  "customerId": 2,
  "details": [
    {
      "itemId": 5,
      "locationId": 3,
      "quantity": 100,
      "unitprice": 50000
    },
    {
      "itemId": 6,
      "locationId": null,
      "quantity": 50,
      "unitprice": 30000
    }
  ]
}
```

> `locationId` có thể để `null` khi tạo DRAFT; phải gán trước khi confirm.
> `batchId` / `batchCode` trong response chỉ có khi đã tạo lô gắn với `receiptDetailId`.

**Response:**
```json
{
  "success": true,
  "message": "Tạo phiếu nhập thành công",
  "data": {
    "id": 1,
    "docno": "PN-2026-001",
    "docDate": "2026-05-05",
    "description": "Nhập hàng tháng 5",
    "docstatus": "DRAFT",
    "customerId": 2,
    "customerName": "Công ty ABC",
    "customerTaxcode": "123456789",
    "createdAt": "2026-05-05T08:30:00",
    "createdByUsername": "admin",
    "createdByFullname": "Admin hệ thống",
    "actionByUsername": null,
    "actionByFullname": null,
    "approvedAt": null,
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
        "locationname": "Kệ A1, tầng 1",
        "batchId": null,
        "batchCode": null
      }
    ]
  }
}
```

### 7.2 Xác nhận phiếu nhập

**Endpoint:** `POST /api/goods-receipts/{id}/confirm` — không cần body.

BE thực hiện:
1. Kiểm tra tất cả dòng đã có `locationId`.
2. Kiểm tra capacity từng vị trí còn đủ chỗ.
3. Cộng `quantity` vào `ItemLocation` (tạo mới nếu chưa có).
4. Cộng `quantity` vào `InventoryBalance`.
5. Nếu có lô gắn với `receiptDetailId`: cộng `quantity` vào `quantityRemaining` của lô.
6. Set `docstatus = CONFIRMED`, lưu `actionByUsername`.

**Lỗi có thể trả về:**
- `"Phiếu nhập không có dòng chi tiết nào"`
- `"Dòng chi tiết với mã hàng 'X' chưa được gán vị trí"`
- `"Vị trí 'A1-01' không đủ sức chứa. Còn trống: 20, cần nhập: 100"`

### 7.3 API hỗ trợ chọn vị trí

**`GET /available-locations?itemId={id}`** — Liệt kê vị trí còn chỗ, không cần truyền `quantity`.

Trả về danh sách sắp xếp: `EXISTING` → `EMPTY` → `PARTIAL`.

```json
[
  {
    "locationId": 3,
    "locationcode": "A1-01",
    "locationname": "Kệ A1, tầng 1",
    "rackno": "A1", "floorno": "1", "columnno": "1",
    "capacity": 100,
    "usedCapacity": 40,
    "remainingCapacity": 60,
    "type": "EXISTING",
    "items": [
      {
        "itemId": 5,
        "itemcode": "SP001",
        "itemname": "Sản phẩm A",
        "unitof": "Cái",
        "quantity": 40,
        "batchCodes": ["LO-HANG-A-20260415-SP001"]
      }
    ]
  }
]
```

**`GET /suggest-locations?itemId={id}&quantity={qty}`** — Gợi ý vị trí đủ sức chứa `quantity`.

**`GET /suggest-split?itemId={id}&quantity={qty}`** — Phân bổ tự động khi `quantity` > sức chứa 1 vị trí; trả thêm `suggestedQuantity`.

```json
[
  {
    "locationId": 3, "locationcode": "A1-01", "locationname": "Kệ A1",
    "capacity": 100, "currentQuantity": 40, "availableSpace": 60,
    "type": "EXISTING", "suggestedQuantity": 60
  },
  {
    "locationId": 7, "locationcode": "B2-01", "locationname": "Kệ B2",
    "capacity": 100, "currentQuantity": 0, "availableSpace": 100,
    "type": "EMPTY", "suggestedQuantity": 40
  }
]
```

---

## 8. Goods Issue – Xuất kho

**Base path:** `/api/goods-issues`

**Luồng:** `DRAFT` → *(chỉnh sửa tùy ý)* → `confirm` → tồn kho được trừ  
*(hoặc)* → `cancel` → phiếu bị hủy (tồn kho không đổi)

| Method | Endpoint | Mô tả | Quyền |
|--------|----------|-------|-------|
| GET | `/api/goods-issues` | Danh sách phiếu xuất | ADMIN, MANAGER, STAFF |
| GET | `/api/goods-issues/{id}` | Chi tiết phiếu xuất | ADMIN, MANAGER, STAFF |
| POST | `/api/goods-issues` | Tạo phiếu nháp | ADMIN, MANAGER, STAFF |
| PUT | `/api/goods-issues/{id}` | Sửa phiếu DRAFT | ADMIN, MANAGER, STAFF |
| POST | `/api/goods-issues/{id}/confirm` | Xác nhận → trừ tồn | ADMIN, MANAGER |
| POST | `/api/goods-issues/{id}/cancel` | Hủy phiếu DRAFT | ADMIN, MANAGER |
| GET | `/api/goods-issues/available-locations?itemId=` | Vị trí có hàng | ADMIN, MANAGER, STAFF |
| GET | `/api/goods-issues/suggest-split?itemId=&quantity=` | Gợi ý phân bổ nhiều vị trí | ADMIN, MANAGER, STAFF |

### 8.1 Tạo / Cập nhật phiếu xuất (DRAFT)

**Request body:**
```json
{
  "docno": "PX-2026-001",
  "docDate": "2026-05-05",
  "description": "Xuất hàng đơn đặt hàng #123",
  "customerId": 3,
  "details": [
    {
      "itemId": 5,
      "locationId": 3,
      "batchId": 1,
      "quantity": 20,
      "unitprice": 55000
    }
  ]
}
```

> `locationId` bắt buộc trước khi confirm; FE nên chọn từ `available-locations`.
> `batchId` tùy chọn; nếu FE gửi, BE sẽ tự động trừ `quantityRemaining` của lô khi xác nhận.

**Response:** cấu trúc tương tự GoodsReceipt, với `docstatus: "DRAFT"`.

### 8.2 Xác nhận phiếu xuất

**Endpoint:** `POST /api/goods-issues/{id}/confirm` — không cần body.

BE thực hiện:
1. Kiểm tra tất cả dòng đã có `locationId`.
2. Kiểm tra `ItemLocation` tại vị trí đó có đủ `quantity`.
3. Kiểm tra `InventoryBalance` tổng không âm sau khi trừ.
4. Trừ `quantity` tại `ItemLocation`; tự động set `isActive = false` khi về 0.
5. Trừ `quantity` tại `InventoryBalance`.
6. Nếu dòng chi tiết có `batchId`: kiểm tra và trừ `quantityRemaining` của lô tương ứng.
7. Set `docstatus = CONFIRMED`.

**Lỗi có thể trả về:**
- `"Phiếu xuất không có dòng chi tiết nào"`
- `"Không tìm thấy tồn kho của 'SP001' tại vị trí 'A1-01'"`
- `"Tồn kho tại vị trí 'A1-01' không đủ số lượng để xuất (cần 50, hiện có 20)"`
- `"Tồn kho tổng của 'SP001' không đủ số lượng để xuất"`
- `"Số lượng của lô 'LITEM00120260506' không đủ để xuất (cần 50, còn lại 30)"`

### 8.3 API hỗ trợ chọn vị trí

**`GET /available-locations?itemId={id}`** — Liệt kê vị trí đang chứa item với `quantity > 0`, sắp xếp tồn giảm dần. Mỗi vị trí trả kèm tất cả hàng đang chứa tại đó.

```json
[
  {
    "locationId": 3,
    "locationcode": "A1-01",
    "locationname": "Kệ A1, tầng 1",
    "capacity": 100,
    "usedCapacity": 40,
    "remainingCapacity": 60,
    "type": "HAS_STOCK",
    "items": [
      { "itemId": 5, "itemcode": "SP001", "itemname": "Sản phẩm A", "unitof": "Cái", "quantity": 40 }
    ]
  }
]
```

**`GET /suggest-split?itemId={id}&quantity={qty}`** — Phân bổ tự động khi xuất nhiều vị trí; ưu tiên vị trí tồn nhiều nhất.

```json
[
  {
    "locationId": 3, "locationcode": "A1-01",
    "capacity": 100, "currentQuantity": 40, "availableSpace": 40,
    "type": "HAS_STOCK", "suggestedQuantity": 20
  }
]
```

---

## 9. Inventory Audit – Kiểm kê

**Base path:** `/api/inventory-audits`

**Luồng:** `DRAFT` → *(nhập số liệu thực tế)* → `confirm` → tồn kho được điều chỉnh theo chênh lệch  
*(hoặc)* → `cancel` → phiếu bị hủy (tồn kho không đổi)

| Method | Endpoint | Mô tả | Quyền |
|--------|----------|-------|-------|
| GET | `/api/inventory-audits` | Danh sách phiếu kiểm kê | ADMIN, MANAGER, STAFF |
| GET | `/api/inventory-audits/{id}` | Chi tiết phiếu kiểm kê | ADMIN, MANAGER, STAFF |
| POST | `/api/inventory-audits` | Tạo phiếu nháp (Manager/Admin có thể gán cho Staff) | ADMIN, MANAGER |
| PUT | `/api/inventory-audits/{id}` | Sửa phiếu DRAFT | ADMIN, MANAGER, STAFF |
| POST | `/api/inventory-audits/{id}/confirm` | Xác nhận → điều chỉnh tồn | ADMIN, MANAGER |
| POST | `/api/inventory-audits/{id}/cancel` | Hủy phiếu DRAFT | ADMIN, MANAGER |
| GET | `/api/inventory-audits/assigned` | Danh sách phiếu được gán cho `STAFF` đang đăng nhập | STAFF |
| PUT | `/api/inventory-audits/{id}/assigned` | `STAFF` cập nhật chi tiết phiếu được gán (trạng thái REQUESTED) | STAFF |
| POST | `/api/inventory-audits/{id}/submit` | `STAFF` gửi kết quả kiểm kê về Manager (chuyển sang SUBMITTED) | STAFF |

### 9.1 Tạo / Cập nhật phiếu kiểm kê (DRAFT)

**Request body:**
```json
{
  "docno": "KK-2026-001",
  "docDate": "2026-05-05",
  "description": "Kiểm kê tháng 5 kệ A1",
  "locationId": 3,
  "assignedUserId": 12,        
  "sendToStaff": true,         
  "details": [
    {
      "itemId": 5,
      "actualquantity": 95,
      "description": "Đếm thực tế 95 cái"
    },
    {
      "itemId": 6,
      "actualquantity": 30,
      "description": null
    }
  ]
}
```

> FE chỉ cần gửi `actualquantity` (số đếm thực tế); BE tự lấy `bookquantity` từ `ItemLocation` và tính `diffquantity = actualquantity - bookquantity`.

**Ghi chú cho FE (gán và nhận yêu cầu):**
- Khi Manager muốn giao nhiệm vụ kiểm kê cho nhân viên: gửi `assignedUserId` (id của `STAFF`) và `sendToStaff=true` trong body của `POST /api/inventory-audits`. BE sẽ lưu phiếu và chuyển `docstatus` thành `REQUESTED`.
- `STAFF` gọi `GET /api/inventory-audits/assigned` để lấy danh sách yêu cầu được giao. `STAFF` cập nhật số liệu qua `PUT /api/inventory-audits/{id}/assigned` (gửi `details` với `actualquantity`), rồi gọi `POST /api/inventory-audits/{id}/submit` để gửi kết quả về Manager (BE chuyển `docstatus` thành `SUBMITTED`).
- Manager có thể xem phiếu ở trạng thái `SUBMITTED` và gọi `POST /api/inventory-audits/{id}/confirm` để áp chênh lệch và chuyển `CONFIRMED`.

**Lưu ý FE sau khi `CONFIRMED`:** Hiển nút `Tạo phiếu điều chỉnh (Nhập/Xuất)` nếu cần tạo phiếu `GoodsReceipt` hoặc `GoodsIssue` kiểu điều chỉnh từ kết quả kiểm kê; nếu muốn, BE có thể cung cấp endpoint tự động tạo phiếu điều chỉnh từ audit đã `CONFIRMED` (tôi có thể implement nếu bạn yêu cầu).

**Response:**
```json
{
  "success": true,
  "message": "Tạo phiếu kiểm kê thành công",
  "data": {
    "id": 1,
    "docno": "KK-2026-001",
    "docDate": "2026-05-05",
    "description": "Kiểm kê tháng 5 kệ A1",
    "docstatus": "DRAFT",
    "locationId": 3,
    "locationcode": "A1-01",
    "locationname": "Kệ A1, tầng 1",
    "createdAt": "2026-05-05T09:00:00",
    "createdByUsername": "admin",
    "createdByFullname": "Admin hệ thống",
    "modifiedAt": null,
    "modifiedBy": null,
    "details": [
      {
        "id": 1,
        "itemId": 5,
        "itemcode": "SP001",
        "itemname": "Sản phẩm A",
        "unitof": "Cái",
        "bookquantity": 100,
        "actualquantity": 95,
        "diffquantity": -5,
        "description": "Đếm thực tế 95 cái"
      }
    ]
  }
}
```

### 9.2 Xác nhận phiếu kiểm kê

**Endpoint:** `POST /api/inventory-audits/{id}/confirm` — không cần body.

BE thực hiện:
1. Kiểm tra phiếu có dòng chi tiết.
2. Với mỗi dòng có `diffquantity ≠ 0`:
   - Nếu `diff > 0` (thừa hàng): cộng tồn `ItemLocation` + `InventoryBalance`.
   - Nếu `diff < 0` (thiếu hàng): trừ tồn (validate không âm).
3. Set `docstatus = CONFIRMED`.

**Lỗi có thể trả về:**
- `"Phiếu kiểm kê không có dòng chi tiết nào"`
- `"Tồn kho tại vị trí 'A1-01' của 'SP001' không đủ sau kiểm kê (sổ sách: 10, chênh lệch: -15)"`
- `"Tồn kho tổng của 'SP001' không đủ sau kiểm kê"`

> **Lưu ý FE:** Nên hiển thị `diffquantity` khi preview để người dùng kiểm tra trước khi confirm. `diff < 0` (đỏ – thiếu hàng), `diff > 0` (xanh – thừa hàng), `diff = 0` (không đổi).

---

## 10. Batch – Lô hàng

**Base path:** `/api/batches`

**Mục đích:** Quản lý lô hàng, phục vụ xuất kho theo FIFO. `batchCode` do BE tự sinh — FE không gửi trường này.

**Quy tắc sinh `batchCode`:**
- Định dạng: `NAMEBATCH-YYYYMMDD-ITEMCODE`
- Nếu trùng (cùng tên lô, ngày, mã hàng): thêm hậu tố `...-01`, `...-02`, ...
- Ví dụ: `LO-HANG-A-20260505-SP001`, `LO-HANG-A-20260505-SP001-01`
- Ký tự đặc biệt và dấu tiếng Việt được chuẩn hóa thành `-`

| Method | Endpoint | Mô tả | Quyền |
|--------|----------|-------|-------|
| GET | `/api/batches` | Danh sách lô hàng | ADMIN, MANAGER, STAFF |
| GET | `/api/batches/{id}` | Chi tiết lô hàng | ADMIN, MANAGER, STAFF |
| POST | `/api/batches` | Tạo lô hàng mới | ADMIN, MANAGER, STAFF |

### 10.1 Tạo lô hàng

**Endpoint:** `POST /api/batches`

**Request body:**
```json
{
  "itemId": 5,
  "nameBatch": "Lô hàng A",
  "receiptDetailId": 10,
  "manufactureDate": "2026-04-15",
  "expiryDate": "2027-04-15",
  "unitCost": 12345.67890,
  "quantity": 100.00000
}
```

| Trường | Bắt buộc | Mô tả |
|--------|----------|-------|
| `itemId` | ✅ | ID hàng hóa |
| `nameBatch` | ✅ | Tên lô (dùng để sinh `batchCode`) |
| `receiptDetailId` | ✅ | ID dòng phiếu nhập tạo ra lô này |
| `manufactureDate` | ❌ | Ngày sản xuất; nếu null dùng ngày hiện tại để sinh mã |
| `expiryDate` | ❌ | Hạn sử dụng |
| `unitCost` | ✅ | Giá nhập lô (> 0) |
| `quantity` | ✅ | Số lượng ban đầu (> 0) |

**Response thành công:**
```json
{
  "success": true,
  "message": "Tạo lô hàng thành công",
  "data": {
    "id": 1,
    "batchCode": "LO-HANG-A-20260415-SP001",
    "itemId": 5,
    "itemcode": "SP001",
    "itemname": "Sản phẩm A",
    "nameBatch": "Lô hàng A",
    "receiptDetailId": 10,
    "manufactureDate": "2026-04-15",
    "expiryDate": "2027-04-15",
    "unitCost": 12345.67890,
    "quantity": 100.00000,
    "quantityRemaining": 0.00000,
    "createdAt": "2026-05-05T10:00:00"
  }
}
```

> `quantityRemaining` được cập nhật khi xác nhận phiếu nhập; FE không gửi trường này.

### 10.2 Danh sách lô hàng

**Endpoint:** `GET /api/batches`

**Response:**
```json
{
  "success": true,
  "message": "Lấy danh sách lô hàng thành công",
  "data": [
    {
      "id": 1,
      "batchCode": "LO-HANG-A-20260415-SP001",
      "itemId": 5,
      "itemcode": "SP001",
      "itemname": "Sản phẩm A",
      "nameBatch": "Lô hàng A",
      "receiptDetailId": 10,
      "manufactureDate": "2026-04-15",
      "expiryDate": "2027-04-15",
      "unitCost": 12345.67890,
      "quantity": 100.00000,
      "quantityRemaining": 75.00000,
      "createdAt": "2026-05-05T10:00:00"
    }
  ]
}
```

---

## 11. Lưu ý chung cho FE

1. **Token JWT:** Gửi kèm mọi request dạng `Authorization: Bearer <token>`. Token hết hạn → 401 → FE chuyển về trang đăng nhập. Nhận 403 dù đã đăng nhập → **xóa token cũ và đăng nhập lại** để lấy token mới chứa `role` (token cũ không có `role` claim sẽ bị từ chối bởi `@PreAuthorize`).
2. **Validate trước khi gửi:** Kiểm tra các trường bắt buộc (xem mục 1) để tránh round-trip không cần thiết.
3. **`locationId` khi nhập/xuất:** Chỉ gửi `locationId` lấy từ API `available-locations` hoặc `suggest-split`. Không tự tạo giá trị.
4. **Kiểm kê:** FE chỉ gửi `actualquantity`; `bookquantity` và `diffquantity` do BE tính và trả về.
5. **`batchCode`:** FE không gửi; BE tự sinh và trả về trong response.
6. **Phiếu CONFIRMED / CANCELLED:** Không gọi PUT để sửa; BE sẽ trả lỗi.
7. **Xử lý lỗi:** Luôn kiểm tra `success === false` → hiển thị `message` cho người dùng, không tiếp tục thao tác.
8. **`docstatus` mapping FE:**
   - `DRAFT` → "Nháp" (badge xám)
   - `REQUESTED` → "Đã giao" (badge vàng) — chỉ phiếu kiểm kê
   - `SUBMITTED` → "Chờ duyệt" (badge cam) — chỉ phiếu kiểm kê
   - `CONFIRMED` → "Đã xác nhận" (badge xanh)
   - `CANCELLED` → "Đã hủy" (badge đỏ)
