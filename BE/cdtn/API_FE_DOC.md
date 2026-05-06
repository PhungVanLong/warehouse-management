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
- User: `role` chỉ nhận `ADMIN` hoặc `STAFF`.
- Phiếu nhập/xuất/kiểm kê: chỉ `DRAFT` mới được sửa hoặc hủy; không thể sửa sau khi `CONFIRMED` hoặc `CANCELLED`.
- Trạng thái phiếu (`docstatus`): `DRAFT` → `CONFIRMED` hoặc `CANCELLED`.

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

> FE lưu `token` vào localStorage/sessionStorage và gửi kèm header `Authorization: Bearer <token>` với mọi request tiếp theo.

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
| GET | `/api/users` | Danh sách người dùng | ADMIN, STAFF |
| GET | `/api/users/{id}` | Chi tiết người dùng | ADMIN, STAFF |
| POST | `/api/users` | Tạo người dùng | ADMIN |
| PUT | `/api/users/{id}` | Cập nhật người dùng | ADMIN |

**Request body tạo/sửa:**
```json
{
  "usercode": "staff01",
  "fullname": "Nhân viên kho",
  "username": "staff01",
  "email": "staff01@company.com",
  "password": "your_password",
  "department": "KHO",
  "role": "STAFF",
  "isActive": true
}
```

---

## 4. Customer

| Method | Endpoint | Mô tả | Quyền |
|--------|----------|-------|-------|
| GET | `/api/customers` | Danh sách khách hàng | ADMIN, STAFF |
| GET | `/api/customers/{id}` | Chi tiết khách hàng | ADMIN, STAFF |
| POST | `/api/customers` | Tạo mới | ADMIN, STAFF |
| PUT | `/api/customers/{id}` | Cập nhật | ADMIN, STAFF |
| DELETE | `/api/customers/{id}` | Xóa | ADMIN |

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
| GET | `/api/items` | Danh sách hàng hóa | ADMIN, STAFF |
| GET | `/api/items/{id}` | Chi tiết hàng hóa | ADMIN, STAFF |
| POST | `/api/items` | Tạo mới | ADMIN, STAFF |
| PUT | `/api/items/{id}` | Cập nhật | ADMIN, STAFF |
| DELETE | `/api/items/{id}` | Xóa | ADMIN |

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
| GET | `/api/locations` | Danh sách vị trí | ADMIN, STAFF |
| GET | `/api/locations/{id}` | Chi tiết vị trí | ADMIN, STAFF |
| GET | `/api/locations/{id}/items` | Vị trí + danh sách hàng hóa đang chứa | ADMIN, STAFF |
| POST | `/api/locations` | Tạo mới | ADMIN, STAFF |
| PUT | `/api/locations/{id}` | Cập nhật | ADMIN, STAFF |
| DELETE | `/api/locations/{id}` | Xóa | ADMIN |

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
| GET | `/api/goods-receipts` | Danh sách phiếu nhập | ADMIN, STAFF |
| GET | `/api/goods-receipts/{id}` | Chi tiết phiếu nhập | ADMIN, STAFF |
| POST | `/api/goods-receipts` | Tạo phiếu nháp | ADMIN, STAFF |
| PUT | `/api/goods-receipts/{id}` | Sửa phiếu DRAFT | ADMIN, STAFF |
| POST | `/api/goods-receipts/{id}/confirm` | Xác nhận → cộng tồn | ADMIN, STAFF |
| POST | `/api/goods-receipts/{id}/cancel` | Hủy phiếu DRAFT | ADMIN, STAFF |
| GET | `/api/goods-receipts/available-locations?itemId=` | Vị trí còn chỗ | ADMIN, STAFF |
| GET | `/api/goods-receipts/suggest-locations?itemId=&quantity=` | Gợi ý vị trí | ADMIN, STAFF |
| GET | `/api/goods-receipts/suggest-split?itemId=&quantity=` | Gợi ý phân bổ nhiều vị trí | ADMIN, STAFF |

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
| GET | `/api/goods-issues` | Danh sách phiếu xuất | ADMIN, STAFF |
| GET | `/api/goods-issues/{id}` | Chi tiết phiếu xuất | ADMIN, STAFF |
| POST | `/api/goods-issues` | Tạo phiếu nháp | ADMIN, STAFF |
| PUT | `/api/goods-issues/{id}` | Sửa phiếu DRAFT | ADMIN, STAFF |
| POST | `/api/goods-issues/{id}/confirm` | Xác nhận → trừ tồn | ADMIN, STAFF |
| POST | `/api/goods-issues/{id}/cancel` | Hủy phiếu DRAFT | ADMIN, STAFF |
| GET | `/api/goods-issues/available-locations?itemId=` | Vị trí có hàng | ADMIN, STAFF |
| GET | `/api/goods-issues/suggest-split?itemId=&quantity=` | Gợi ý phân bổ nhiều vị trí | ADMIN, STAFF |

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
| GET | `/api/inventory-audits` | Danh sách phiếu kiểm kê | ADMIN, STAFF |
| GET | `/api/inventory-audits/{id}` | Chi tiết phiếu kiểm kê | ADMIN, STAFF |
| POST | `/api/inventory-audits` | Tạo phiếu nháp | ADMIN, STAFF |
| PUT | `/api/inventory-audits/{id}` | Sửa phiếu DRAFT | ADMIN, STAFF |
| POST | `/api/inventory-audits/{id}/confirm` | Xác nhận → điều chỉnh tồn | ADMIN, STAFF |
| POST | `/api/inventory-audits/{id}/cancel` | Hủy phiếu DRAFT | ADMIN, STAFF |

### 9.1 Tạo / Cập nhật phiếu kiểm kê (DRAFT)

**Request body:**
```json
{
  "docno": "KK-2026-001",
  "docDate": "2026-05-05",
  "description": "Kiểm kê tháng 5 kệ A1",
  "locationId": 3,
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
| GET | `/api/batches` | Danh sách lô hàng | ADMIN, STAFF |
| GET | `/api/batches/{id}` | Chi tiết lô hàng | ADMIN, STAFF |
| POST | `/api/batches` | Tạo lô hàng mới | ADMIN, STAFF |

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

1. **Token JWT:** Gửi kèm mọi request dạng `Authorization: Bearer <token>`. Token hết hạn → 401 → FE chuyển về trang đăng nhập.
2. **Validate trước khi gửi:** Kiểm tra các trường bắt buộc (xem mục 1) để tránh round-trip không cần thiết.
3. **`locationId` khi nhập/xuất:** Chỉ gửi `locationId` lấy từ API `available-locations` hoặc `suggest-split`. Không tự tạo giá trị.
4. **Kiểm kê:** FE chỉ gửi `actualquantity`; `bookquantity` và `diffquantity` do BE tính và trả về.
5. **`batchCode`:** FE không gửi; BE tự sinh và trả về trong response.
6. **Phiếu CONFIRMED / CANCELLED:** Không gọi PUT để sửa; BE sẽ trả lỗi.
7. **Xử lý lỗi:** Luôn kiểm tra `success === false` → hiển thị `message` cho người dùng, không tiếp tục thao tác.
8. **`docstatus` mapping FE:**
   - `DRAFT` → "Nháp" (badge xám)
   - `CONFIRMED` → "Đã xác nhận" (badge xanh)
   - `CANCELLED` → "Đã hủy" (badge đỏ)
