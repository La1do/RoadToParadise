const REACTION_POOLS = {
  cheer: ['cat_happy', 'cat_fist'],
  determined: ['cat_happy', 'cat_fist'],
  thinking: ['cat_loading', 'cat_confused'],
  shocked: ['cat_confused', 'cat_loading'],
  angry: ['cat_angry', 'cat_revenge'],
  wake_up: ['cat_please', 'cat_loading']
};

export function getStickerFeedback(type, grade, variation = '') {
  let mood = type;
  let text;
  if (grade) {
    const wrong = (grade.userTokensResult || []).filter(t => t.status === 'wrong').length;
    const missing = (grade.targetTokensResult || []).filter(t => t.status === 'missing').length;
    const isBlank = grade.userCount === 0 || (grade.userTokensResult || []).length === 0;

    if (grade.isExact) {
      mood = 'determined';
      text = 'Chuẩn rồi! Đập tay với mèo nào!';
    } else if (isBlank) {
      mood = 'wake_up';
      text = 'Đừng để trống nhé! Thử nhớ và điền từng ý nào.';
    } else if (wrong === 0 && missing > 0) {
      mood = 'thinking';
      text = `Sắp đủ rồi! Bổ sung ${missing} từ ở phần (+) nhé.`;
    } else if (wrong > 0 && missing === 0) {
      mood = 'angry';
      text = `Mèo bắt được ${wrong} từ thừa! Bỏ phần gạch ngang nhé.`;
    } else {
      mood = grade.accuracy < 40 ? 'angry' : 'shocked';
      text = `Có ${wrong} từ sai/thừa và ${missing} từ cần bổ sung. Gạch bỏ phần sai, thêm phần (+) nhé!`;
    }
  }

  const explicitCatPools = {
    cat_please: ['cat_please', 'cat_loading'],
    cat_loading: ['cat_loading', 'cat_confused'],
    cat_confused: ['cat_confused', 'cat_please'],
    cat_fist: ['cat_fist', 'cat_happy']
  };
  const pool = REACTION_POOLS[mood] || explicitCatPools[mood] || [mood];
  // Giữ biểu cảm ổn định khi gõ; chỉ đổi khi kết quả hoặc lượt chạm thay đổi.
  const signature = `${variation}:${JSON.stringify(grade?.diff || [])}`;
  const hash = Array.from(signature).reduce((value, char) => (value * 31 + char.charCodeAt(0)) >>> 0, 0);
  return { type: pool[hash % pool.length], text };
}
