# Thiết kế Responsive 1 Màn Hình (1-Screen Viewport Fit) - CustomExamReview

## 1. Mục tiêu & Vấn đề cần giải quyết
- **Hiện trạng**: Màn hình thiết lập (`Setup View`) và màn hình làm bài (`Session View`) quá dài trên Laptop và Mobile, buộc người dùng phải cuộn trang liên tục để chọn chế độ, chọn câu và bấm nút Bắt đầu.
- **Mục tiêu**: Người dùng thao tác chọn chế độ, chọn câu và bắt đầu bài ôn/thi trên **1 màn hình duy nhất** (không phải cuộn trang) trên cả Laptop, iPad và Điện thoại.

## 2. Bố cục theo từng kích thước thiết bị

### 2.1. Laptop & Desktop (`min-width: 992px`)
- **Bố cục 2 cột song song**:
  - **Cột trái (38%)**:
    - Tiêu đề gọn gàng: `🎯 ÔN TẬP & THI RIÊNG` kèm icon và mô tả siêu ngắn.
    - Chọn 1 trong 3 hình thức: 3 nút dọc mềm mại (Chép lại, Xáo từ, Thi riêng).
    - Tùy chọn checkbox: Xáo trộn câu hỏi, Mở sẵn đáp án mẫu (hoặc giới hạn thời gian).
    - Nút hành động chính: `🚀 BẮT ĐẦU (...) →` to rõ ngay dưới tùy chọn.
  - **Cột phải (62%)**:
    - Thanh Presets: `Tất cả`, `Chặng 1-4`, `Ngẫu nhiên`, `Sổ Tiếc Nuối`.
    - Lưới câu hỏi 1..20: Dạng thẻ rút gọn hiển thị mã câu, chặng, số ý và tóm tắt ngắn, chiều cao cuộn nội bộ mượt mà trong tầm mắt (~280px - 340px).

### 2.2. iPad & Tablet (`768px <= width < 992px`)
- Tương tự Laptop nhưng tỷ lệ 2 cột `42% : 58%`.
- Touch target nút bấm `>= 44px`.

### 2.3. Điện thoại Mobile (`width < 768px`)
- **Bố cục 1 cột dọc co gọn tối đa**:
  - Tiêu đề 1 dòng: `🎯 Ôn & Thi Riêng`.
  - Chế độ ôn: 3 tab ngang cạnh nhau `[✍️ Chép]` `[🧩 Xáo từ]` `[📝 Thi]` (cao ~40px).
  - Presets: Các viên thuốc nhỏ vuốt ngang hoặc 2 dòng gọn.
  - Lưới 20 câu: Lưới 5 cột × 4 dòng các ô vuông số `1` đến `20` (nhỏ gọn ~140px - 160px). Chạm chọn từng câu hoặc chọn theo preset.
  - Checkbox tùy chọn: 1 dòng gọn gàng.
  - Nút `🚀 Bắt đầu`: Ghim cố định ở mép dưới cùng màn hình (sticky bottom, có backdrop blur), tiện tay ngón cái chạm ngay.

## 3. Các thành phần bị xóa hoặc tinh giản
- Xóa bỏ đoạn văn bản giới thiệu dông dài trong `setup-header`.
- Bỏ khoảng cách đệm (gap & padding) thừa thãi, chuyển gap từ `24px` sang `10px - 14px`.
- Rút gọn kích thước card câu hỏi trong chế độ chọn để vừa khít màn hình.

## 4. Kế hoạch kiểm thử & Tiêu chuẩn nghiệm thu
- Chạy 43+ unit tests hiện tại đảm bảo không hồi quy logic chấm thi / xáo từ.
- Kiểm tra hiển thị thực tế trên các breakpoint: 390px (Mobile), 820px (iPad), 1366px & 1440px (Laptop).
