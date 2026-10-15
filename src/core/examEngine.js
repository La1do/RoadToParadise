/**
 * examEngine.js - Quản lý phiên thi, chấm từng ô, thống kê kết quả và tạo phiên ôn lại ô sai
 */

import { compareAnswer } from './gradeEngine.js';

/**
 * Tạo một slot item phẳng từ question và slot để quản lý trong phiên thi
 */
export function flattenSlots(questions) {
  const flat = [];
  for (const q of questions) {
    for (const slot of q.slots) {
      flat.push({
        slotKey: `q${q.id}_s${slot.slotIndex}`,
        questionId: q.id,
        stageId: q.stageId,
        slotIndex: slot.slotIndex,
        label: slot.label,
        slotTitle: slot.title,
        questionText: q.question,
        targetAnswer: slot.answer,
        phrases: slot.phrases || []
      });
    }
  }
  return flat;
}

/**
 * Khởi tạo một phiên thi (Exam Session)
 * @param {object} params
 * @param {Array} params.questions - Danh sách câu hỏi gốc từ questions.json
 * @param {'STAGE' | 'RANDOM_N' | 'FULL' | 'REVIEW_WRONG'} params.mode - Chế độ thi
 * @param {number} [params.stageId] - ID chặng (1-4) nếu mode là STAGE
 * @param {number} [params.count] - Số câu ngẫu nhiên nếu mode là RANDOM_N
 * @param {string[]} [params.wrongSlotKeys] - Danh sách slotKey cần thi lại nếu mode là REVIEW_WRONG
 * @returns {object} examSession
 */
export function createExamSession({
  questions,
  mode = 'FULL',
  stageId = null,
  count = null,
  wrongSlotKeys = null
}) {
  let selectedQuestions = [...questions];

  if (mode === 'STAGE' && stageId) {
    selectedQuestions = selectedQuestions.filter(q => q.stageId === stageId);
  } else if (mode === 'RANDOM_N' && count) {
    const shuffled = [...selectedQuestions].sort(() => 0.5 - Math.random());
    selectedQuestions = shuffled.slice(0, Math.min(count, selectedQuestions.length));
  }

  let slots = flattenSlots(selectedQuestions);

  if (mode === 'REVIEW_WRONG' && Array.isArray(wrongSlotKeys)) {
    const keySet = new Set(wrongSlotKeys);
    // Lấy từ toàn bộ questions
    const allSlots = flattenSlots(questions);
    slots = allSlots.filter(s => keySet.has(s.slotKey));
  }

  return {
    id: `exam_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    mode,
    stageId,
    startTime: new Date().toISOString(),
    endTime: null,
    status: slots.length > 0 ? 'in_progress' : 'completed',
    currentIndex: 0,
    totalSlots: slots.length,
    slots,
    submissions: {} // key: slotKey -> { userInput, gradeResult, submittedAt, isCorrect }
  };
}

/**
 * Nộp bài cho ô hiện tại trong phiên thi
 * @param {object} session
 * @param {string} userInput
 * @returns {{ session: object, gradeResult: object, isExamComplete: boolean }}
 */
export function submitSlotAnswer(session, userInput) {
  if (session.status === 'completed') {
    throw new Error('Exam session is already completed.');
  }

  const currentSlot = session.slots[session.currentIndex];
  if (!currentSlot) {
    throw new Error('Current slot not found.');
  }

  const gradeResult = compareAnswer(userInput, currentSlot.targetAnswer);

  const updatedSubmissions = {
    ...session.submissions,
    [currentSlot.slotKey]: {
      slotKey: currentSlot.slotKey,
      userInput,
      gradeResult,
      submittedAt: new Date().toISOString(),
      isCorrect: gradeResult.isExact
    }
  };

  const isExamComplete = Object.keys(updatedSubmissions).length === session.totalSlots;

  const updatedSession = {
    ...session,
    submissions: updatedSubmissions,
    status: isExamComplete ? 'completed' : 'in_progress',
    endTime: isExamComplete ? new Date().toISOString() : null
  };

  return {
    session: updatedSession,
    gradeResult,
    isExamComplete
  };
}

/**
 * Chuyển tới ô tiếp theo
 */
export function nextSlot(session) {
  if (session.currentIndex < session.totalSlots - 1) {
    return {
      ...session,
      currentIndex: session.currentIndex + 1
    };
  }
  return session;
}

/**
 * Quay lại ô trước
 */
export function prevSlot(session) {
  if (session.currentIndex > 0) {
    return {
      ...session,
      currentIndex: session.currentIndex - 1
    };
  }
  return session;
}

/**
 * Nhảy trực tiếp tới ô có chỉ số cụ thể
 */
export function jumpToSlot(session, index) {
  if (index >= 0 && index < session.totalSlots) {
    return {
      ...session,
      currentIndex: index
    };
  }
  return session;
}

/**
 * Tổng kết kết quả phiên thi
 * @param {object} session
 * @returns {{
 *   totalSlots: number,
 *   answeredCount: number,
 *   correctCount: number,
 *   wrongCount: number,
 *   averageAccuracy: number,
 *   passed: boolean,
 *   wrongSlots: Array<object>,
 *   wrongSlotKeys: string[]
 * }}
 */
export function summarizeExam(session) {
  const answered = Object.values(session.submissions);
  const total = session.totalSlots;
  const answeredCount = answered.length;

  let correctCount = 0;
  let totalAccuracy = 0;
  const wrongSlots = [];
  const wrongSlotKeys = [];

  for (const slot of session.slots) {
    const sub = session.submissions[slot.slotKey];
    if (sub && sub.isCorrect) {
      correctCount++;
      totalAccuracy += sub.gradeResult.accuracy;
    } else {
      wrongSlots.push({
        slot,
        submission: sub || null
      });
      wrongSlotKeys.push(slot.slotKey);
      if (sub) {
        totalAccuracy += sub.gradeResult.accuracy;
      }
    }
  }

  const averageAccuracy = total > 0 ? Math.round(totalAccuracy / total) : 0;
  const wrongCount = total - correctCount;
  const passed = wrongCount === 0 && total > 0;

  return {
    totalSlots: total,
    answeredCount,
    correctCount,
    wrongCount,
    averageAccuracy,
    passed,
    wrongSlots,
    wrongSlotKeys
  };
}

/**
 * Tạo phiên ôn lại các ô làm sai từ phiên thi vừa kết thúc ("Ôn lại các ô sai")
 * @param {object} completedSession
 * @param {Array} allQuestions
 * @returns {object} examSession
 */
export function createReviewSession(completedSession, allQuestions) {
  const summary = summarizeExam(completedSession);
  return createExamSession({
    questions: allQuestions,
    mode: 'REVIEW_WRONG',
    wrongSlotKeys: summary.wrongSlotKeys
  });
}
