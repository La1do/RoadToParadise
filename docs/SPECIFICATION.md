# TÀI LIỆU ĐẶC TẢ KỸ THUẬT & KIẾN TRÚC DỰ ÁN
## Game: "Một Đời Người, Một Con Đường"

---

## 1. TỔNG QUAN DỰ ÁN

- **Tên dự án**: Một Đời Người, Một Con Đường.
- **Mục tiêu**: Web game học thuộc lòng chính xác từng chữ (tiếng Việt có dấu) bộ 20 câu hỏi trọng tâm (50 ô đáp án).
- **Triết lý sản phẩm**: 
  - Học tập thông qua cốt truyện nhẹ nhàng, ấm áp, đậm chất đời thực.
  - Không có trừng phạt "thua" hay "chết"; chỉ có "sang ngày mới" và tiếp tục hoàn thiện các ô còn thiếu sót.
  - Con đường ánh sáng dần mở ra tương ứng với mức độ thuộc bài của người học.
- **Công nghệ nền tảng**:
  - React 19 + Vite 6.
  - CSS thuần (CSS Variables, CSS Keyframes animation).
  - 100% SVG nội tuyến cho nhân vật và minh họa kịch bản (không dùng ảnh ngoài hay thư viện icon nặng).
  - Lưu trữ: `localStorage` (hỗ trợ in-memory fallback cho môi trường test Node.js).
  - Kiểm thử: Node.js Test Runner built-in (`node --test`).

---

## 2. CỐT TRUYỆN & THẾ GIỚI

### 2.1. Nhân vật chính
- **Tên**: Minh (có thể thay đổi trong cài đặt).
- **Hồ sơ**: 21 tuổi, sinh viên năm cuối vừa học vừa làm thêm phụ giúp gia đình, ở trọ một mình tại thành phố.
- **Tính cách & Ngoại hình**:
  - Người bình thường, không có siêu năng lực hay phép thuật.
  - Dáng người hơi gầy, nét mặt hiền, ánh mắt ấm áp pha chút mệt mỏi sau những giờ học và làm thêm nhưng luôn kiên trì.
  - Nhận diện: Balo đeo lệch một bên vai, dây thẻ sinh viên đeo cổ (hoặc tai nghe).

### 2.2. Vòng lặp 1 ngày = 4 Chặng (20 câu hỏi)
Một ngày của Minh được chia làm 4 chặng đời sống thực tế:
1. **Chặng 1 (Sáng ở phòng trọ - Câu 1 đến 5)**:
   - *Bối cảnh*: 6:00 sáng, ánh nắng vàng nhạt rọi qua ô cửa sổ nhỏ. Điện thoại reo báo câu cần học trong ngày. Minh mở ra đọc, dắt xe đi học và nhẩm lại từng câu trong đầu.
   - *Cơ chế game chủ đạo*: **Game 1: Chép lại (Copy)**.
2. **Chặng 2 (Đường đi & Giảng đường - Câu 6 đến 10)**:
   - *Bối cảnh*: Giữa dòng xe cộ, ngã tư đèn đỏ, các biển hiệu, tờ rơi, giấy note dán trên bảng tin giảng đường và thư viện có các từ xáo trộn gợi nhắc câu kinh.
   - *Cơ chế game chủ đạo*: **Game 2: Xáo từ (Scramble / Arrange)**.
3. **Chặng 3 (Chỗ làm thêm - Câu 11 đến 15)**:
   - *Bối cảnh*: Quán cà phê/quán ăn buổi chiều tà, hoàng hôn cam ấm. Minh vừa lau bàn, bê đồ cho khách vừa nhẩm bài trong đầu, mệt nhoài nhưng vẫn cố gắng.
   - *Cơ chế game chủ đạo*: **Điền khuyết (Cloze 30% - 60%) & Chữ cái đầu**.
4. **Chặng 4 (Đêm về phòng trọ & Cổng Phán Xét - Câu 16 đến 20)**:
   - *Bối cảnh*: Đêm khuya tĩnh lặng, ánh đèn bàn ấm áp trong phòng trọ. Minh đọc thầm lại toàn bộ bài học và bước tới trước Cổng Ánh Sáng.
   - *Cơ chế game chủ đạo*: **Chế độ Thi (Exam / Full Recall)**.

### 2.3. Kết cục và Ý nghĩa biểu tượng
- **Con đường lên thiên đàng**: Là dải ánh sáng xuất hiện ở cuối ngày (ngoài ô cửa sổ, chân trời thành phố). Mỗi ô câu hỏi được học thuộc sẽ làm ánh sáng này bừng sáng và rực rỡ hơn qua biến số `--do-thuoc` (từ `0.00` đến `1.00`).
- **Sau bài thi**:
  - *Đạt 100%*: Cổng Ánh Sáng mở ra toàn diện, dẫn vào vinh hiển.
  - *Chưa đạt*: Chuyển sang "Ngày mới", không có thông báo Game Over, các ô làm sai sẽ nhấp nháy trên bản đồ kèm tùy chọn "Ôn lại các ô sai".

---

## 3. CẤU TRÚC DỮ LIỆU (`src/data/questions.json`)

Nguồn văn bản chuẩn trích xuất từ tài liệu `KỲ THI CAO CẤP.docx`:
- **Tổng số câu**: 20 câu.
- **Tổng số ô**: 50 ô điền (ký hiệu: ①, ②, ③, ④).
- **Phân bổ chặng**: 4 chặng × 5 câu.

### Cấu trúc JSON chi tiết:
```json
{
  "stages": [
    { "id": 1, "name": "Tuổi thơ", "subtitle": "Chặng 1: Khởi đầu đức tin", "questionIds": [1, 2, 3, 4, 5] },
    { "id": 2, "name": "Tuổi trẻ", "subtitle": "Chặng 2: Vượt qua thử thách", "questionIds": [6, 7, 8, 9, 10] },
    { "id": 3, "name": "Trưởng thành", "subtitle": "Chặng 3: Chiến đấu và đắc thắng", "questionIds": [11, 12, 13, 14, 15] },
    { "id": 4, "name": "Tuổi già", "subtitle": "Chặng 4: Khải hoàn về đích", "questionIds": [16, 17, 18, 19, 20] }
  ],
  "questions": [
    {
      "id": 1,
      "stageId": 1,
      "question": "Đức Chúa Trời ban cho hai loại khải thị ① là gì?...",
      "slots": [
        {
          "slotIndex": 1,
          "label": "①",
          "title": "Hai loại khải thị Đức Chúa Trời ban cho",
          "answer": "Khải thị khải tượng (lời tiên tri), Khải thị thực thể",
          "phrases": [
            "Khải thị khải tượng",
            "(lời tiên tri),",
            "Khải thị thực thể"
          ]
        }
      ]
    }
  ]
}
```

---

## 4. CÁC CORE ENGINE ĐỘC LẬP (`src/core/`)

Tất cả các engine được viết dạng Pure JavaScript/Modules độc lập hoàn toàn với UI, cho phép kiểm thử tự động 100%.

### 4.1. Grade Engine (`src/core/gradeEngine.js`)
- **Quy tắc vàng**: **Bắt buộc đúng dấu tiếng Việt (sai dấu = sai chữ)**.
- **Quy trình chuẩn hóa `tokenize(text)`**:
  1. Chuẩn hóa Unicode NFC (`text.normalize('NFC')`) để triệt tiêu độ lệch mã ký tự giữa các bộ gõ tiếng Việt (Telex, VNI) trên iOS, Android, Windows, macOS.
  2. Chuyển chữ thường (`toLowerCase()`).
  3. Bỏ dấu câu, ký tự đặc biệt, mũi tên, dấu ngoặc: `[.,:;!?'"()\[\]{}—–→/\\<>+=_*&^%$#@|]`.
  4. Đồng nhất `~`, `-` và khoảng trắng. (Ví dụ: `Kh 17:5~7` và `Kh 17:5-7` sau chuẩn hóa đều thành `kh 17 5 7`).
  5. Giữ nguyên toàn bộ nguyên âm tiếng Việt có dấu `[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]`.
  6. Gộp nhiều khoảng trắng liền kề thành 1 khoảng trắng duy nhất.
- **Thuật toán so sánh `compareAnswer(userInput, targetAnswer)`**:
  - Sử dụng giải thuật **Longest Common Subsequence (LCS)** ở cấp độ từ (word-level).
  - Trả về:
    - `isExact`: boolean (đúng 100% không thừa, không thiếu từ).
    - `accuracy`: phần trăm độ chính xác (0 - 100%).
    - `userTokensResult`: mảng các từ user đã gõ kèm trạng thái `correct` (xanh) hoặc `wrong` (đỏ).
    - `targetTokensResult`: mảng các từ của đáp án chuẩn kèm trạng thái `correct` hoặc `missing` (vàng).
    - `diff`: danh sách so sánh chi tiết.

### 4.2. Learning Step Engine (`src/core/learningStepEngine.js`)
Cung cấp thang 6 bậc học cho từng ô câu hỏi:
1. **Bậc 1 (Chép lại - `COPY`)**: Hiển thị sẵn đáp án mẫu, người học gõ lại chính xác để làm quen mặt chữ.
2. **Bậc 2 (Xếp cụm - `ARRANGE`)**: Dùng `slot.phrases` (chia sẵn 2-5 từ). Xáo trộn ngẫu nhiên, người học kéo thả hoặc chạm để xếp đúng thứ tự.
3. **Bậc 3 (Điền khuyết 30% - `CLOZE_30`)**: Ẩn ngẫu nhiên 30% số từ, người học gõ điền vào chỗ trống.
4. **Bậc 4 (Điền khuyết 60% - `CLOZE_60`)**: Ẩn 60% số từ, chỉ để lại 40% từ khóa làm neo gợi nhớ.
5. **Bậc 5 (Chữ cái đầu - `FIRST_LETTER`)**: Hiển thị ký tự viết hoa đầu tiên của mỗi từ (ví dụ: `Đ___ C___ T___`).
6. **Bậc 6 (Gõ hoàn toàn - `FULL_TYPING`)**: Tự nhớ và gõ lại toàn bộ câu trả lời mà không có bất kỳ trợ giúp nào.

### 4.3. Exam Engine (`src/core/examEngine.js`)
- Quản lý phiên thi:
  - Chế độ thi theo chặng (`STAGE`).
  - Chế độ ngẫu nhiên N câu (`RANDOM_N`).
  - Chế độ thi toàn diện 20 câu (`FULL`).
  - Chế độ **"Ôn lại các ô sai"** (`REVIEW_WRONG`).
- Tự động thống kê bài thi: `totalSlots`, `correctCount`, `wrongCount`, `averageAccuracy`, danh sách `wrongSlotKeys`.

### 4.4. Spaced Repetition Engine (`src/core/spacedRepetitionEngine.js`)
- Quản lý cấp độ thuộc bài (Mastery Level 0 đến 5) theo thuật toán lặp lại ngắt quãng:
  - Mức 1: Sau 1 ngày.
  - Mức 2: Sau 3 ngày.
  - Mức 3: Sau 7 ngày.
  - Mức 4: Sau 14 ngày.
  - Mức 5: Sau 30 ngày (Thuộc sâu bền vững).
- **Quy tắc đặc thù**:
  - Gõ đúng không gợi ý: Tăng cấp độ thuộc, dời lịch ôn tập ra xa.
  - Gõ sai: Reset chuỗi đúng, lùi cấp độ thuộc, đưa lịch ôn về 1 ngày.
  - **Dùng nút Gợi ý 1 từ**: **Tuyệt đối không tính tăng độ thuộc**, chu kỳ dời về 1 ngày để người học ôn lại.
- Tính toán tổng độ thuộc bài toàn bộ 50 ô (`calculateOverallMastery`) phục vụ biến số độ sáng thiên đàng.

### 4.5. Mistake Book Engine - Sổ "Tiếc Nuối" (`src/core/mistakeBookEngine.js`)
- Tự động ghi lại các từ và ô câu hỏi người học hay gõ sai nhiều nhất (ví dụ: `ni-cô-la`, `Ê-xê`, `Mat 15:24`, `Kh 17:5~7`).
- Bảng xếp hạng các từ dễ nhầm lẫn.
- Tự động tạo bài ôn tập tập trung vào những lỗ hổng trí nhớ này.
- Khi người học trả lời đúng một ô 3 lần liên tiếp, ô đó sẽ được đánh dấu là `resolved` (đã khắc phục).

### 4.6. Hint Engine (`src/core/hintEngine.js`)
- `getNextWordHint(currentInput, targetAnswer)`: Phân tích vị trí gõ hiện tại và trả về chính xác từ tiếp theo người học cần gõ.
- Gắn cờ `usedHint = true` vào lượt làm bài để bảo đảm tính nghiêm ngặt của thuật toán SRS.

### 4.7. Storage Engine (`src/core/storageEngine.js`)
- Quản lý đồng bộ `localStorage` với các khóa:
  - `mdn_learning_steps`: Tiến độ bậc học (1-6) của từng ô.
  - `mdn_srs_data`: Dữ liệu lặp lại ngắt quãng của 50 ô.
  - `mdn_mistake_book`: Dữ liệu Sổ Tiếc Nuối.
  - `mdn_exam_history`: Lịch sử các bài thi.
  - `mdn_settings`: Cài đặt cá nhân.
- Hỗ trợ sao lưu (Export JSON) và phục hồi (Import JSON) toàn bộ tiến trình học.

---

## 5. THIẾT KẾ NHÂN VẬT MINH (SVG + CSS NỘI TUYẾN)

- **Vị trí**: `src/components/character/MinhCharacter.jsx`, `MinhCharacter.css`.
- **Kỹ thuật**: 100% Vector SVG, không dùng file ảnh `.png`/`.jpg` bên ngoài, hoàn toàn đáp ứng (responsive), độ nét sắc sảo ở mọi mật độ điểm ảnh.
- **Tỉ lệ cơ thể**: Chuẩn người thật tỉ lệ 1/7 (~72px phần đầu / 495px tổng chiều cao), không phong cách chibi.
- **Cấu trúc 14 nhóm `<g>`**:
  `dau`, `toc-truoc`, `toc-sau`, `mat-trai`, `mat-phai`, `long-may`, `mieng`, `co`, `than`, `tay-trai`, `tay-phai`, `chan`, `giay`, `phu-kien`.
- **Khớp xoay animation**: Khai báo `transform-origin` chính xác tại vai, khuỷu tay, hông, đầu gối.

### 5.1. 6 Biểu cảm (.class)
- `.dung-yen`: Ánh nhìn ấm áp, mỉm nhẹ hiền hòa.
- `.vui`: Mắt cười cong hình trăng khuyết, má ửng hồng đào, miệng cười tươi.
- `.buon`: Lông mày cau cụp, mí mắt trĩu xuống, khóe môi trễ.
- `.suy-nghi`: Một bên mày nhướng cao, mắt liếc chéo, miệng mím lệch, có biểu tượng `?` lơ lửng.
- `.met`: Mí mắt sụp 50%, có quầng thâm nhẹ, giọt mồ hôi rơi ở thái dương.
- `.bat-ngo`: Mắt mở to tròn, đồng tử co nhỏ, miệng chữ O, có dấu `!` và tia giật mình.

### 5.2. 5 Tư thế (.class)
- `.dung`: Đứng thẳng tự nhiên góc 3/4.
- `.di-bo`: Chân và tay so le nhịp nhàng, gối co duỗi, thân nhấp nhô nhẹ.
- `.ngoi-chay-xe`: Thân hơi chồm về phía trước, tay cầm ghi-đông, chân gập gác chân xe máy.
- `.ngoi-ban-hoc`: Ngồi gập gối 90 độ, tay cầm bút, có mặt bàn và sách mở.
- `.cui-nhin-dien-thoai`: Đầu cúi 20 độ, hai tay co trước ngực cầm điện thoại hắt ánh sáng màn hình.

### 5.3. 4 Bộ trang phục (CSS Variables)
Biến điều khiển: `--mau-ao`, `--mau-quan`, `--mau-giay`, `--mau-toc`, `--phu-kien`.
- `.di-hoc`: Áo sơ mi trắng/xanh, quần jean xanh denim, sneaker trắng, thẻ sinh viên xanh, balo than chì.
- `.lam-them`: Áo polo nâu cà phê, quần âu tối màu, tạp dề cam quán cà phê.
- `.o-nha`: Áo thun cotton xám rộng rãi, quần lửng thoải mái, tai nghe quàng cổ.
- `.cong-phan-xet`: Áo khoác đen tối giản trang trọng, quần âu sẫm màu, huy hiệu vàng ánh kim.

### 5.4. Animation CSS
- **Nhịp thở**: `@keyframes tho-nguc` lặp chậm 3.6s.
- **Chớp mắt**: `@keyframes chop-mat` tự động chớp mỗi 3.8s.
- **Tóc đung đưa**: 2 tầng tóc trước và sau lay nhẹ trong gió.
- **Hào quang**: Đĩa sáng vàng ấm xoay chậm phía sau lưng, cường độ ánh sáng tỉ lệ thuận với biến `var(--do-thuoc)`.
- **Hỗ trợ tiếp cận**: Tự động tắt hoạt ảnh chuyển động mạnh khi hệ thống bật `@media (prefers-reduced-motion: reduce)`.

---

## 6. GIAO DIỆN & CÁC MÀN HÌNH CHÍNH

### 6.1. Bản đồ một ngày (`DayRoadMap.jsx`)
- Khổ màn hình: **Mobile-first (rộng 360px - 430px)**, tự động căn giữa trên màn hình desktop/tablet.
- Bố cục uốn lượn hình chữ S zic-zac trải qua 4 chặng từ sáng sớm tới đêm khuya.
- Mỗi câu hiển thị các ô tròn đại diện cho các ô ①, ②, ③.
- **Hiệu ứng 4 mức phát sáng ấm của ô tròn**:
  - `Level 0`: Xám mờ (chưa học).
  - `Level 1 - 2`: Vàng nhạt dịu mắt (mới thuộc).
  - `Level 3 - 4`: Vàng rực rõ nét (thuộc khá).
  - `Level 5`: Hào quang sáng chói kèm hiệu ứng thở nhịp nhàng `✦` (thuộc sâu bền vững).
- Điểm cuối con đường: Vầng sáng thiên đàng rực rỡ, độ mở rộng tăng theo tổng độ thuộc của người chơi.
- Avatar Minh: Tự động đánh dấu vị trí câu hỏi người chơi cần học tiếp theo.

### 6.2. Cảnh kịch bản ngắn (`CutscenePlayer.jsx`)
- Thời lượng 5 - 10 giây mỗi cảnh trước khi bước vào chặng mới.
- Nút **"Bỏ qua" (Skip)** kích thước lớn (chiều cao >= 44px), viền bo rõ, thân thiện với màn hình cảm ứng.
- Lời dẫn truyện hiển thị tuần tự theo tiến trình thời gian.
- Hình minh họa SVG thuần: Khung cửa sổ nắng sớm, đèn đường & biển hiệu thành phố, quán cà phê làm thêm, khung cửa sổ trăng sao đêm khuya.

### 6.3. Game 1: Chép lại (`Game1Copy.jsx`)
- Khung mẫu hiển thị đáp án với font chữ tiếng Việt tương phản cao, dễ đọc.
- Ô gõ văn bản:
  - Tắt tự sửa chính tả: `autoCorrect="off"`, `spellCheck="false"`.
  - Tắt tự động viết hoa: `autoCapitalize="none"`.
  - Hỗ trợ gõ dấu Telex/VNI hoàn hảo trên bàn phím ảo điện thoại và bàn phím máy tính.
- Nút "Kiểm tra": Chấm điểm tức thì, tô đỏ các từ gõ sai, làm nổi bật các từ còn thiếu.
- Nút "Gợi ý 1 từ": Cung cấp ngay từ tiếp theo khi bị nghẽn trí nhớ.

### 6.4. Game 2: Xáo từ / Xếp cụm (`Game2Scramble.jsx`)
- Sử dụng các cụm 2 - 5 từ đã được chia sẵn trong dữ liệu.
- Hàng thẻ từ bên dưới: Chiều cao tối thiểu 44px, bo góc mềm mại, chạm là bay lên khay ghép trên.
- Khay ghép bên trên: Chạm vào cụm từ trên khay để đưa ngược lại xuống dưới.
- Sau khi ghép đúng thứ tự -> Chuyển sang bước gõ nhẩm lại cả câu để khắc sâu trí nhớ.

### 6.5. Màn kết quả (`GameResultModal.jsx`)
- Thống kê tỷ lệ phần trăm chính xác (%), số từ đúng, số từ sai, số từ thiếu.
- Liệt kê các từ sai được tô đỏ nổi bật.
- Cung cấp nút tiện ích: **"Ôn lại các ô sai"** để thi lại ngay lập tức chỉ các ô bị điểm kém.

---

## 7. CẤU TRÚC THƯ MỤC SOURCE CODE

```
mot-doi-nguoi-mot-con-duong/
├── docs/
│   └── SPECIFICATION.md          # Tài liệu đặc tả kỹ thuật này
├── src/
│   ├── core/                     # Toàn bộ Core Logic độc lập
│   │   ├── gradeEngine.js        # Chấm điểm tiếng Việt, so sánh LCS
│   │   ├── learningStepEngine.js # Thang 6 bậc học
│   │   ├── examEngine.js         # Quản lý phiên thi, ôn ô sai
│   │   ├── spacedRepetitionEngine.js # Lặp lại ngắt quãng 1/3/7/14/30 ngày
│   │   ├── mistakeBookEngine.js  # Sổ Tiếc Nuối lưu từ/ô hay sai
│   │   ├── hintEngine.js         # Gợi ý 1 từ
│   │   ├── storageEngine.js      # Lưu localStorage + Memory fallback
│   │   └── index.js              # Export tập trung các engine
│   ├── data/
│   │   └── questions.json        # 20 câu chuẩn, 50 ô, chia sẵn cụm 2-5 từ
│   ├── styles/
│   │   └── theme.css             # Biến CSS 4 chặng, dark/light, cảm ứng
│   ├── components/
│   │   ├── character/            # Nhân vật Minh SVG + Animation
│   │   │   ├── MinhCharacter.jsx
│   │   │   ├── MinhCharacter.css
│   │   │   ├── CharacterDemo.jsx
│   │   │   └── index.js
│   │   ├── cutscenes/            # Cảnh kịch bản ngắn 4 chặng
│   │   │   ├── cutscenesData.js
│   │   │   ├── CutsceneIllustrations.jsx
│   │   │   ├── CutscenePlayer.jsx
│   │   │   ├── CutscenePlayer.css
│   │   │   └── index.js
│   │   ├── map/                  # Bản đồ một ngày
│   │   │   ├── DayRoadMap.jsx
│   │   │   ├── DayRoadMap.css
│   │   │   ├── dayRoadMapConfig.js
│   │   │   └── index.js
│   │   └── games/                # Các mini-game học thuộc
│   │       ├── Game1Copy.jsx
│   │       ├── Game1Copy.css
│   │       ├── Game2Scramble.jsx
│   │       ├── Game2Scramble.css
│   │       ├── GameResultModal.jsx
│   │       ├── GameResultModal.css
│   │       └── index.js
│   ├── App.jsx                   # Shell điều hướng chính của Web App
│   └── main.jsx                  # Điểm khởi động React
├── tests/                        # 25 bài kiểm thử tự động
│   ├── core_engines.test.js      # Test 7 engine cốt lõi
│   ├── minh_character.test.js    # Test cấu trúc SVG và CSS nhân vật
│   ├── cutscenes.test.js         # Test kịch bản 4 chặng
│   ├── day_roadmap.test.js       # Test bản đồ, 4 mức phát sáng, 50 ô
│   └── games.test.js             # Test Game 1, Game 2, Modal kết quả
├── index.html
├── package.json
└── vite.config.js
```

---

## 8. HƯỚNG DẪN KIỂM THỬ VÀ VẬN HÀNH

### 8.1. Chạy bài kiểm thử tự động (Unit Tests)
```bash
cd /home/truongdb/Desktop/mot-doi-nguoi-mot-con-duong
npm test
```
*Hiện tại toàn bộ 25/25 bài test tự động bao phủ từ hàm chấm điểm, gõ sai dấu, các bậc học, SRS, nhân vật SVG và bản đồ đều đạt 100%.*

### 8.2. Chạy ứng dụng trong môi trường phát triển (Dev Server)
```bash
npm run dev
```
Mở đường link `http://localhost:5173/` trên trình duyệt máy tính hoặc điện thoại cùng mạng nội bộ.

### 8.3. Đóng gói sản phẩm tĩnh (Production Build)
```bash
npm run build
```
Thư mục `dist/` tạo ra là trang web tĩnh hoàn chỉnh, có thể triển khai ngay lên GitHub Pages, Vercel, Netlify hoặc Cloudflare Pages mà không cần bất kỳ backend hay server phức tạp nào.

---

## 9. KẾ HOẠCH NÂNG CẤP & MỞ RỘNG (GIAI ĐOẠN TIẾP THEO)

1. **Âm thanh & Hiệu ứng haptic**:
   - Âm thanh gõ máy chữ lách cách nhẹ nhàng khi gõ đúng từ.
   - Âm chuông ngân ấm áp khi hoàn thành một ô hoặc khi ánh sáng thiên đàng mở ra.
2. **Mini-game phụ chuyên biệt**:
   - Game tìm chữ sai trong câu (câu bị sửa đổi 1 từ tinh vi).
   - Game chuỗi thứ tự liên chặng (ví dụ: Câu 1③ → Câu 15①).
   - Thử thách tốc độ (Speed Run).
3. **PWA (Progressive Web App)**:
   - Thêm `manifest.json` và `service-worker.js` để người dùng có thể cài đặt app trực tiếp lên màn hình chính điện thoại và học ngoại tuyến (Offline) 100%.
