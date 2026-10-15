# Một Đời Người, Một Con Đường

Web game học thuộc lòng chính xác từng chữ (tiếng Việt có dấu) bộ 20 câu kinh trọng tâm (50 ô đáp án), thiết kế mobile-first (360-430px) bằng React 19 + Vite + CSS thuần + SVG nội tuyến.

## 📖 Tài liệu Đặc tả Toàn diện
Tất cả kiến trúc, cốt truyện, thuật toán chấm điểm, thang 6 bậc học, thuật toán lặp lại ngắt quãng (SRS), nhân vật Minh SVG và cấu trúc hệ thống được ghi lại đầy đủ trong:
👉 [**docs/SPECIFICATION.md**](docs/SPECIFICATION.md)

---

## 🚀 Khởi chạy nhanh

### Cài đặt thư viện
```bash
npm install
```

### Chạy kiểm thử tự động (25 test suites)
```bash
npm test
```

### Chạy ứng dụng giao diện (Dev Mode)
```bash
npm run dev
```

### Đóng gói sản phẩm tĩnh (Build)
```bash
npm run build
```

---

## 🎮 Các tính năng đã hoàn thiện

1. **Dữ liệu chuẩn hóa (`src/data/questions.json`)**:
   - 20 câu chuẩn từ `KỲ THI CAO CẤP.docx`, 50 ô, chia sẵn cụm 2-5 từ.
2. **Core Engines (`src/core/`)**:
   - Chấm điểm LCS: Bắt buộc đúng dấu tiếng Việt (sai dấu = sai chữ), chuẩn hóa Unicode NFC, tô đỏ từ sai, tô vàng từ thiếu.
   - Thang 6 bậc học: Chép lại → Xếp cụm → Điền khuyết 30% → 60% → Chữ cái đầu → Gõ hoàn toàn.
   - Quản lý bài thi & tính năng "Ôn lại các ô sai".
   - Spaced Repetition (SRS): Chu kỳ 1/3/7/14/30 ngày. Dùng gợi ý 1 từ thì không tính độ thuộc.
   - Sổ "Tiếc Nuối": Thống kê các từ và ô hay gõ sai để tạo bài ôn tập tự động.
   - Storage Engine: Lưu trữ cục bộ qua localStorage, không cần backend.
3. **Nhân vật Minh (`src/components/character/`)**:
   - 100% SVG nội tuyến, chuẩn tỉ lệ 1/7, anime flat.
   - 6 biểu cảm khuôn mặt, 5 tư thế toàn thân, 4 bộ trang phục qua biến CSS.
   - Animation thở, chớp mắt, lay tóc, bước đi, đĩa hào quang sáng ấm theo `--do-thuoc`.
4. **Bản đồ một ngày & Kịch bản 4 chặng (`src/components/map/`, `src/components/cutscenes/`)**:
   - Uốn lượn 4 chặng: Sáng phòng trọ → Giảng đường → Chỗ làm thêm → Đêm về Cổng phán xét.
   - Ô tròn phát sáng 4 mức theo cấp độ thuộc, Cổng Thiên Đàng cuối đường rực rỡ dần.
   - Kịch bản ngắn 5-10s cho mỗi chặng có nút "Bỏ qua" cảm ứng >= 44px.
5. **Mini-game học tập (`src/components/games/`)**:
   - Game 1 "Chép lại": Bàn phím Telex/VNI tối ưu, chấm điểm từ tức thì, nút gợi ý.
   - Game 2 "Xáo từ / Xếp cụm": Chạm cảm ứng khay trên-dưới, gõ củng cố sau khi ghép.
   - Màn kết quả: Thống kê chính xác %, nút "Ôn lại các ô sai".
