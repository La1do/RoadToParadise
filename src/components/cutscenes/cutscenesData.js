/**
 * Dữ liệu kịch bản ngắn (Cutscenes) cho 4 chặng:
 * Chặng 1: Sáng ở phòng trọ
 * Chặng 2: Trên đường & Giảng đường
 * Chặng 3: Chỗ làm thêm
 * Chặng 4: Đêm về phòng trọ & Cổng phán xét
 */

export const CUTSCENES = [
  {
    stageId: 1,
    themeClass: 'theme-stage-1',
    chapter: 'Chặng 1',
    title: 'Sáng ở phòng trọ',
    setting: 'Căn phòng trọ nhỏ lúc 6:00 sáng',
    duration: 8000,
    lines: [
      'Điện thoại reo báo câu kinh mới cho ngày hôm nay.',
      'Minh mở ra đọc, ánh nắng sớm khẽ rọi qua rèm cửa soi rõ từng dòng chữ.',
      'Chuẩn bị dắt xe đi học, Minh vừa đạp nổ xe vừa nhẩm lại từng câu trong đầu...'
    ],
    startStageText: 'Bắt đầu Chặng 1',
    illustrationType: 'morning-window'
  },
  {
    stageId: 2,
    themeClass: 'theme-stage-2',
    chapter: 'Chặng 2',
    title: 'Trên đường & Giảng đường',
    setting: 'Ngã tư đèn đỏ & Giờ ra chơi thư viện',
    duration: 8500,
    lines: [
      'Dừng đèn đỏ giữa ngã tư tấp nập, dòng người và xe cộ hối hả qua lại.',
      'Những biển hiệu hàng quán, tờ rơi chữ lộn xộn bên đường bỗng gợi nhớ câu kinh vừa học.',
      'Giờ ra chơi trong thư viện giảng đường tĩnh lặng, từng mảnh ghép lời dạy dần sáng rõ trong tâm trí...'
    ],
    startStageText: 'Bắt đầu Chặng 2',
    illustrationType: 'traffic-library'
  },
  {
    stageId: 3,
    themeClass: 'theme-stage-3',
    chapter: 'Chặng 3',
    title: 'Chỗ làm thêm',
    setting: 'Quán ăn chiều tối tấp nập',
    duration: 8500,
    lines: [
      'Chiều tối đông nghịt khách, tiếng thìa dĩa và gọi món vang khắp quán.',
      'Minh liên tục bê đồ cho khách rồi khom lưng lau dọn từng chiếc bàn.',
      'Chân tay mỏi nhừ sau ngày dài vừa học vừa làm, nhưng trong đầu Minh vẫn bền bỉ nhẩm từng từ...'
    ],
    startStageText: 'Bắt đầu Chặng 3',
    illustrationType: 'coffee-work'
  },
  {
    stageId: 4,
    themeClass: 'theme-stage-4',
    chapter: 'Chặng 4',
    title: 'Đêm về phòng trọ & Cổng phán xét',
    setting: 'Căn phòng trọ đêm khuya & Cổng Ánh Sáng',
    duration: 9000,
    lines: [
      'Căn phòng trọ đêm khuya yên tĩnh, chỉ còn tiếng tích tắc của đồng hồ.',
      'Minh thắp ngọn đèn nhỏ nơi góc bàn, đọc thầm lại từng câu kinh suốt chặng đường đã qua.',
      'Ánh sáng bừng lên mờ ảo, Minh bước tới trước Cổng Ánh Sáng (Cổng phán xét) uy nghiêm ở phía xa.'
    ],
    startStageText: 'Bắt đầu Chặng 4',
    illustrationType: 'night-gate'
  }
];

export function getCutsceneByStageId(stageId) {
  const numericId = Number(stageId);
  return CUTSCENES.find(c => c.stageId === numericId) || CUTSCENES[0];
}
