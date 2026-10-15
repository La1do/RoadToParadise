import { useRef, useEffect, useState, useCallback } from 'react';

/**
 * useMotorbikeAudio - Web Audio API tổng hợp âm thanh xe máy Honda Wave 110cc
 * Hoàn toàn bằng bộ tổng hợp âm thanh (procedural synthesis), không phụ thuộc file âm thanh ngoài.
 *
 * Tính năng:
 * - Tiếng đề & nổ máy (starter crank & engine rev) khi khởi động
 * - Vòng lặp tiếng máy xe 4 kỳ 110cc (tần số thay đổi theo tốc độ chạy)
 * - Còi xe máy "bíp bíp" (phím H hoặc nút còi)
 * - Tự động giảm âm lượng (ducking) khi người chơi đang gõ
 * - Khởi tạo sau tương tác đầu tiên của người dùng
 * - Lưu trạng thái bật/tắt âm thanh vào localStorage
 */
export function useMotorbikeAudio() {
  const [isMuted, setIsMuted] = useState(() => {
    try {
      return localStorage.getItem('motorbike_audio_muted') === 'true';
    } catch {
      return false;
    }
  });

  const [hasInteracted, setHasInteracted] = useState(false);
  const audioCtxRef = useRef(null);

  // Nodes cho tiếng động cơ
  const engineGainRef = useRef(null);
  const engineOscRef = useRef(null);
  const subOscRef = useRef(null);
  const filterRef = useRef(null);
  const isEngineRunningRef = useRef(false);

  // Khởi tạo AudioContext sau tương tác người dùng
  const ensureAudioContext = useCallback(() => {
    if (typeof window === 'undefined') return null;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;

    if (!audioCtxRef.current) {
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    setHasInteracted(true);
    return audioCtxRef.current;
  }, []);

  // Chuyển đổi trạng thái Mute
  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      try {
        localStorage.setItem('motorbike_audio_muted', String(next));
      } catch {
        // bỏ qua
      }
      if (engineGainRef.current) {
        engineGainRef.current.gain.value = next ? 0 : 0.12;
      }
      return next;
    });
  }, []);

  // 1. Tiếng đề và nổ máy (Starter crank + Ignition roar)
  const playIgnition = useCallback(() => {
    const ctx = ensureAudioContext();
    if (!ctx || isMuted) return;

    const now = ctx.currentTime;

    // Tiếng củ đề quay "xẹt xẹt" (starter motor)
    const starterOsc = ctx.createOscillator();
    const starterGain = ctx.createGain();
    starterOsc.type = 'sawtooth';
    starterOsc.frequency.setValueAtTime(65, now);
    starterOsc.frequency.exponentialRampToValueAtTime(140, now + 0.45);

    starterGain.gain.setValueAtTime(0.08, now);
    starterGain.gain.linearRampToValueAtTime(0.15, now + 0.25);
    starterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    starterOsc.connect(starterGain);
    starterGain.connect(ctx.destination);
    starterOsc.start(now);
    starterOsc.stop(now + 0.55);

    // Tiếng động cơ bốc nổ "vút" (Ignition roar)
    const roarOsc = ctx.createOscillator();
    const roarGain = ctx.createGain();
    const roarFilter = ctx.createBiquadFilter();

    roarOsc.type = 'triangle';
    roarOsc.frequency.setValueAtTime(45, now + 0.35);
    roarOsc.frequency.exponentialRampToValueAtTime(120, now + 0.65);
    roarOsc.frequency.exponentialRampToValueAtTime(55, now + 1.2);

    roarFilter.type = 'lowpass';
    roarFilter.frequency.setValueAtTime(280, now + 0.35);
    roarFilter.frequency.exponentialRampToValueAtTime(550, now + 0.7);
    roarFilter.frequency.exponentialRampToValueAtTime(220, now + 1.2);

    roarGain.gain.setValueAtTime(0.001, now + 0.35);
    roarGain.gain.linearRampToValueAtTime(0.2, now + 0.65);
    roarGain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);

    roarOsc.connect(roarFilter);
    roarFilter.connect(roarGain);
    roarGain.connect(ctx.destination);
    roarOsc.start(now + 0.35);
    roarOsc.stop(now + 1.3);
  }, [ensureAudioContext, isMuted]);

  // 2. Vòng lặp tiếng máy xe 4 kỳ 110cc
  const startEngine = useCallback((initialSpeed = 'cruise') => {
    const ctx = ensureAudioContext();
    if (!ctx || isEngineRunningRef.current) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const subOsc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const masterGain = ctx.createGain();

    // Sóng răng cưa mô phỏng tiếng pít-tông nén nổ
    osc.type = 'sawtooth';
    subOsc.type = 'triangle';

    const baseFreq = initialSpeed === 'idle' ? 32 : (initialSpeed === 'slow' ? 42 : 58);
    osc.frequency.setValueAtTime(baseFreq, now);
    subOsc.frequency.setValueAtTime(baseFreq * 0.5, now);

    // Bộ lọc hạ thông tạo âm trầm đặc trưng của pô xe Wave
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(initialSpeed === 'idle' ? 180 : 320, now);
    filter.Q.setValueAtTime(2.2, now);

    masterGain.gain.setValueAtTime(isMuted ? 0 : 0.12, now);

    osc.connect(filter);
    subOsc.connect(filter);
    filter.connect(masterGain);
    masterGain.connect(ctx.destination);

    osc.start(now);
    subOsc.start(now);

    engineOscRef.current = osc;
    subOscRef.current = subOsc;
    filterRef.current = filter;
    engineGainRef.current = masterGain;
    isEngineRunningRef.current = true;
  }, [ensureAudioContext, isMuted]);

  // Điều chỉnh tốc độ động cơ theo trạng thái (chay, slow/tap-trung, idle)
  const setEngineSpeed = useCallback((speedMode = 'cruise') => {
    if (!audioCtxRef.current || !engineOscRef.current || !filterRef.current) return;
    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;

    let targetFreq = 58;
    let targetFilter = 320;

    if (speedMode === 'idle') {
      targetFreq = 30;
      targetFilter = 160;
    } else if (speedMode === 'slow' || speedMode === 'focus') {
      // Giảm tốc nền còn 30-40% khi đang tập trung xếp/gõ
      targetFreq = 38;
      targetFilter = 220;
    } else if (speedMode === 'fast') {
      targetFreq = 72;
      targetFilter = 420;
    }

    engineOscRef.current.frequency.cancelScheduledValues(now);
    engineOscRef.current.frequency.setTargetAtTime(targetFreq, now, 0.4);

    if (subOscRef.current) {
      subOscRef.current.frequency.cancelScheduledValues(now);
      subOscRef.current.frequency.setTargetAtTime(targetFreq * 0.5, now, 0.4);
    }

    filterRef.current.frequency.cancelScheduledValues(now);
    filterRef.current.frequency.setTargetAtTime(targetFilter, now, 0.4);
  }, []);

  // Tự động giảm âm lượng động cơ khi người chơi đang gõ
  const setDucking = useCallback((isTyping) => {
    if (!audioCtxRef.current || !engineGainRef.current || isMuted) return;
    const now = audioCtxRef.current.currentTime;
    const targetGain = isTyping ? 0.04 : 0.12;
    engineGainRef.current.gain.cancelScheduledValues(now);
    engineGainRef.current.gain.setTargetAtTime(targetGain, now, 0.2);
  }, [isMuted]);

  // 3. Tiếng còi xe máy "bíp bíp" (440Hz + 554Hz)
  const playHorn = useCallback(() => {
    const ctx = ensureAudioContext();
    if (!ctx || isMuted) return;

    const now = ctx.currentTime;
    const tone1 = ctx.createOscillator();
    const tone2 = ctx.createOscillator();
    const hornGain = ctx.createGain();

    tone1.type = 'triangle';
    tone2.type = 'square';
    tone1.frequency.setValueAtTime(440, now); // nốt A4
    tone2.frequency.setValueAtTime(554.37, now); // nốt C#5

    hornGain.gain.setValueAtTime(0.18, now);
    hornGain.gain.setValueAtTime(0.18, now + 0.16);
    hornGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    tone1.connect(hornGain);
    tone2.connect(hornGain);
    hornGain.connect(ctx.destination);

    tone1.start(now);
    tone2.start(now);
    tone1.stop(now + 0.22);
    tone2.stop(now + 0.22);
  }, [ensureAudioContext, isMuted]);

  // Dừng động cơ khi unmount
  useEffect(() => {
    return () => {
      try {
        if (engineOscRef.current) engineOscRef.current.stop();
        if (subOscRef.current) subOscRef.current.stop();
      } catch {
        // bỏ qua
      }
      isEngineRunningRef.current = false;
    };
  }, []);

  return {
    isMuted,
    hasInteracted,
    toggleMute,
    ensureAudioContext,
    playIgnition,
    startEngine,
    setEngineSpeed,
    setDucking,
    playHorn
  };
}
