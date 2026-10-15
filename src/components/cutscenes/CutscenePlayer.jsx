import React, { useState, useEffect, useRef } from 'react';
import { getCutsceneByStageId } from './cutscenesData';
import { CutsceneIllustration } from './CutsceneIllustrations';
import './CutscenePlayer.css';

/**
 * Trình diễn Cảnh kịch bản ngắn (CutscenePlayer)
 *
 * @param {Object} props
 * @param {number} [props.stageId=1] - ID chặng (1, 2, 3, 4)
 * @param {Object} [props.cutscene] - Cấu hình cutscene tùy chỉnh nếu có
 * @param {() => void} props.onComplete - Hàm callback khi bấm "Bắt đầu chặng"
 * @param {() => void} [props.onSkip] - Hàm callback khi bấm "Bỏ qua" (nếu bỏ trống sẽ gọi onComplete)
 * @param {boolean} [props.autoPlay=true] - Tự động phát cảnh
 */
export default function CutscenePlayer({
  stageId = 1,
  cutscene: customCutscene,
  onComplete,
  onSkip,
  autoPlay = true
}) {
  const scene = customCutscene || getCutsceneByStageId(stageId);
  const totalDuration = scene.duration || 8000; // 5-10 giây theo yêu cầu
  const lineCount = scene.lines.length;

  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isFinished, setIsFinished] = useState(false);

  const requestRef = useRef(null);
  const startTimeRef = useRef(null);

  // Tính số câu cần hiển thị theo thời gian trôi qua
  // Mỗi câu chia đều trong khoảng 85% thời lượng đầu, 15% cuối giữ nguyên để người đọc ngẫm
  const activeLineIndex = Math.min(
    lineCount - 1,
    Math.floor((elapsedTime / (totalDuration * 0.85)) * lineCount)
  );

  const progressPercent = Math.min(100, (elapsedTime / totalDuration) * 100);

  // Bộ đếm thời gian mượt mà với requestAnimationFrame
  useEffect(() => {
    if (!isPlaying || isFinished) {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      return;
    }

    const step = timestamp => {
      if (!startTimeRef.current) startTimeRef.current = timestamp - elapsedTime;
      const currentElapsed = timestamp - startTimeRef.current;

      if (currentElapsed >= totalDuration) {
        setElapsedTime(totalDuration);
        setIsFinished(true);
        setIsPlaying(false);
      } else {
        setElapsedTime(currentElapsed);
        requestRef.current = requestAnimationFrame(step);
      }
    };

    requestRef.current = requestAnimationFrame(step);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, isFinished, totalDuration, elapsedTime]);

  // Reset khi đổi stageId hoặc cutscene
  useEffect(() => {
    setElapsedTime(0);
    setIsFinished(false);
    setIsPlaying(autoPlay);
    startTimeRef.current = null;
  }, [stageId, customCutscene, autoPlay]);

  // Xử lý Bỏ qua cảnh (Skip)
  const handleSkip = () => {
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    if (onSkip) {
      onSkip(scene);
    } else if (onComplete) {
      onComplete(scene);
    } else {
      setIsFinished(true);
      setElapsedTime(totalDuration);
    }
  };

  // Xử lý Bắt đầu chặng
  const handleStartStage = () => {
    if (onComplete) {
      onComplete(scene);
    }
  };

  // Xử lý Xem lại từ đầu
  const handleReplay = () => {
    setElapsedTime(0);
    setIsFinished(false);
    setIsPlaying(true);
    startTimeRef.current = null;
  };

  return (
    <div
      className={`cutscene-overlay ${scene.themeClass || `theme-stage-${scene.stageId}`}`}
      data-testid="cutscene-player"
      role="region"
      aria-label={`Cảnh dẫn truyện: ${scene.title}`}
    >
      {/* Header: Huy hiệu chặng & Nút Bỏ qua */}
      <header className="cutscene-header">
        <div className="cutscene-badge">
          <span>{scene.chapter}</span>
        </div>

        <button
          type="button"
          className="cutscene-skip-btn"
          onClick={handleSkip}
          aria-label="Bỏ qua cảnh dẫn truyện để vào học ngay"
        >
          <span>Bỏ qua</span>
          <span aria-hidden="true">⏭</span>
        </button>
      </header>

      {/* Khung minh họa SVG thuần */}
      <div className="cutscene-illustration-container">
        <CutsceneIllustration type={scene.illustrationType} />
      </div>

      {/* Thanh tiến trình thời gian của cảnh */}
      <div
        className="cutscene-progress-track"
        role="progressbar"
        aria-valuenow={Math.round(progressPercent)}
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <div
          className="cutscene-progress-bar"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Lời dẫn truyện tuần tự */}
      <div className="cutscene-content">
        <h2 className="cutscene-title">{scene.title}</h2>
        <div className="cutscene-setting">{scene.setting}</div>

        <div className="cutscene-narrative-list" aria-live="polite">
          {scene.lines.map((line, idx) => {
            const isVisible = idx <= activeLineIndex || isFinished;
            if (!isVisible) return null;

            const isActive = idx === activeLineIndex && !isFinished;
            const isPast = idx < activeLineIndex || isFinished;

            return (
              <p
                key={idx}
                className={`cutscene-line ${isActive ? 'active' : ''} ${isPast ? 'past' : ''}`}
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                {line}
              </p>
            );
          })}
        </div>
      </div>

      {/* Nút Bắt đầu chặng khi kết thúc hoặc xem lại */}
      <footer className="cutscene-footer">
        {isFinished && (
          <button
            type="button"
            className="cutscene-replay-btn"
            onClick={handleReplay}
          >
            ↻ Xem lại cảnh
          </button>
        )}

        <button
          type="button"
          className="cutscene-start-btn"
          onClick={handleStartStage}
          aria-label={`Bắt đầu chặng học ${scene.chapter}`}
        >
          <span>{scene.startStageText || 'Bắt đầu chặng'}</span>
          <span aria-hidden="true">➔</span>
        </button>
      </footer>
    </div>
  );
}
