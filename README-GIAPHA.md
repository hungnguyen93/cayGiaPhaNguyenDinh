# 🌳 Phần Mềm Cây Gia Phả

Ứng dụng web hiển thị cây gia phả từ dữ liệu file Excel với giao diện đơn giản, đẹp mắt.

## ✨ Tính năng

- 📊 **Đọc dữ liệu từ Excel**: Hỗ trợ file .xlsx, .xls
- 🌲 **Hiển thị dạng cây**: Cây gia phả với các nhánh rõ ràng
- 🎨 **Phân biệt giới tính**: Màu xanh dương cho nam, màu hồng cho nữ
- 👆 **Click để xem chi tiết**: Hiển thị thông tin đầy đủ khi click vào thành viên
- 📱 **Responsive**: Tự động điều chỉnh trên mọi thiết bị
- 📥 **Tải file mẫu**: Có sẵn file Excel mẫu để tham khảo

## 🚀 Cách sử dụng

### 1. Cài đặt

```bash
npm install
```

### 2. Chạy ứng dụng

```bash
npm run dev
```

Truy cập: `http://localhost:5173` hoặc port được hiển thị trong terminal

### 3. Sử dụng

1. **Tải file mẫu** bằng nút "⬇️ Tải file mẫu" để xem cấu trúc dữ liệu
2. **Chỉnh sửa file Excel** theo gia phả của bạn
3. **Tải file lên** bằng nút "📁 Tải file Excel"
4. **Click vào thành viên** để xem thông tin chi tiết

## 📋 Cấu trúc file Excel

File Excel cần có các cột sau:

| Cột | Mô tả | Bắt buộc |
|-----|-------|----------|
| ID | Mã số duy nhất của thành viên | ✅ |
| Họ tên | Họ và tên đầy đủ | ✅ |
| Giới tính | Nam hoặc Nữ | ✅ |
| Năm sinh | Năm sinh (số) | ✅ |
| Năm mất | Năm mất (số, để trống nếu còn sống) | ❌ |
| IDCha | ID của cha (số, để trống nếu là gốc) | ❌ |
| IDMẹ | ID của mẹ (số, để trống nếu là gốc) | ❌ |
| Ghi chú | Thông tin bổ sung | ❌ |

### Ví dụ dữ liệu

```
ID | Họ tên        | Giới tính | Năm sinh | Năm mất | IDCha | IDMẹ | Ghi chú
---|---------------|-----------|----------|---------|-----|----|-----------
1  | Nguyễn Văn A  | Nam       | 1920     | 1990    |     |    | Ông cố
2  | Trần Thị B    | Nữ        | 1925     | 1995    |     |    | Bà cố
3  | Nguyễn Văn C  | Nam       | 1945     | 2010    | 1   | 2  | Con trai cả
4  | Lê Thị D      | Nữ        | 1950     |         |     |    | Vợ của C
5  | Nguyễn Văn E  | Nam       | 1970     |         | 3   | 4  | Cháu nội
```

## 🎨 Giao diện

- **Header**: Tiêu đề và nút upload/download
- **Cây gia phả**: Hiển thị bên trái với các node có màu sắc
- **Chi tiết thành viên**: Hiển thị bên phải khi click vào node

### Màu sắc

- 🔵 **Nam**: Gradient xanh dương
- 🔴 **Nữ**: Gradient hồng
- ⭐ **Node được chọn**: Viền vàng, phóng to nhẹ

## 💡 Lưu ý

- **ID phải là số duy nhất** cho mỗi thành viên
- **IDCha/IDMẹ** phải tham chiếu đến ID đã tồn tại
- **Thành viên không có IDCha/IDMẹ** sẽ là gốc của cây
- Có thể có **nhiều gốc** (nhiều nhánh gia phả)
- File Excel phải có **sheet đầu tiên** chứa dữ liệu

## 🛠️ Công nghệ sử dụng

- **React 18** - UI Framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **xlsx** - Đọc file Excel
- **CSS3** - Styling với gradient và animations

## 📝 Tùy chỉnh

### Thay đổi màu sắc

Chỉnh sửa file `src/App.css`:

```css
/* Màu cho nam */
.node-card.male {
  background: linear-gradient(135deg, #4299e1 0%, #667eea 100%);
}

/* Màu cho nữ */
.node-card.female {
  background: linear-gradient(135deg, #ed64a6 0%, #f687b3 100%);
}
```

### Thay đổi kích thước node

```css
.node-card {
  min-width: 200px;  /* Thay đổi độ rộng */
  padding: 15px 25px; /* Thay đổi padding */
}
```

## 📄 License

MIT License - Tự do sử dụng và chỉnh sửa

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Hãy tạo Pull Request hoặc Issue.

---

Chúc bạn thành công với cây gia phả của mình! 🌳✨
