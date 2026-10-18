import { useCallback, useRef } from 'react';
import { HudIntro } from './HudIntro';
import { ClefArt, ParanadaArt, StaffLines } from './level/introArt';
import { MentorBubble } from './mentor/MentorBubble';
import { OrnateFrame } from './OrnateFrame';
import { poseForStep } from './mentor/mentorPoses';
import { useIntroduction } from '../hooks/useIntroduction';
import { LEVEL_HASH, isFirstStep, isLastStep, nextButtonLabel, stepLabel } from '../lib/intro';
import { navigateWithFade } from '../lib/navigate';
import { markIntroCompleted } from '../hooks/useLevelProgress';

/**
 * Halaman Introduction — struktur id/class/step dipertahankan sama seperti
 * markup asli (step1–step3, btnPrev, btnNext, note-pitch, pitch-info, svg-note).
 */
export const Introduction = () => {
  const {
    step,
    pitchIndex,
    level,
    noteY,
    isDragging,
    goPrevStep,
    goNextStep,
    changePitch,
    primeAudio,
    beginDrag,
    moveDrag,
    endDrag,
  } = useIntroduction();

  const staffRef = useRef<SVGSVGElement>(null);

  /** Ubah koordinat kursor (client) ke koordinat user-unit viewBox SVG. */
  const toUserPoint = useCallback((clientX: number, clientY: number) => {
    const svg = staffRef.current;
    const ctm = svg?.getScreenCTM();
    if (!svg || !ctm) return null;
    const point = svg.createSVGPoint();
    point.x = clientX;
    point.y = clientY;
    const { x, y } = point.matrixTransform(ctm.inverse());
    return { x, y };
  }, []);

  // ---- Drag not (step 3) ----
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      const p = toUserPoint(e.clientX, e.clientY);
      if (!p) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      beginDrag(p.y);
    },
    [beginDrag, toUserPoint]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!isDragging) return;
      const p = toUserPoint(e.clientX, e.clientY);
      if (!p) return;
      moveDrag(p.y);
    },
    [isDragging, moveDrag, toUserPoint]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!isDragging) return;
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
      endDrag();
    },
    [endDrag, isDragging]
  );

  // ---- Keyboard pada not (role slider) ----
  const handleNoteKeyDown = useCallback(
    (e: React.KeyboardEvent<SVGEllipseElement>) => {
      let next = pitchIndex;
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = pitchIndex - 1;
      else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = pitchIndex + 1;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = 8;
      else return;
      e.preventDefault();
      changePitch(next);
    },
    [changePitch, pitchIndex]
  );

  const handlePrev = useCallback(() => {
    goPrevStep();
  }, [goPrevStep]);

  const handleNext = useCallback(() => {
    if (isLastStep(step)) {
      // Langkah terakhir: tandai Introduction tuntas lalu buka halaman Level
      // (daftar Materi Latihan). Sejak itu tombol Materi Latihan di landing
      // ikut terbuka.
      markIntroCompleted();
      navigateWithFade(`#/${LEVEL_HASH}`);
      return;
    }
    goNextStep();
  }, [goNextStep, step]);

  return (
    <div className="intro-page">
      {/* Header: logo + indikator langkah */}
      <header className="intro-header">
        <a className="intro-logo" href="#/" aria-label="Kembali ke halaman utama Basicmelody">
          Basicmelody.
        </a>
        <p className="step-indicator" aria-live="polite">
          {stepLabel(step)}
        </p>
      </header>

      <div className="intro-container">
        <div id="step1" className={`step-content${step === 1 ? ' active' : ''}`}>
          <h2>1. Mengenal Paranada</h2>
          <MentorBubble pose={poseForStep(1)} text="Perhatikan garis dan ruang pada paranada!" active={step === 1} />
          <OrnateFrame className="ornate-frame--surface">
            <ParanadaArt
              id="paranada-area"
              label="Ilustrasi lima garis dan empat ruang paranada, disorot bergantian dari atas ke bawah"
            />
          </OrnateFrame>
          <div className="explanation-container">
            <h3>Penjelasan:</h3>
            <p>
              <strong>Garis Paranada:</strong> Lima garis horizontal tempat penulisan not musik.
            </p>
            <p>
              <strong>Ruang Paranada:</strong> Empat ruang di antara garis untuk menempatkan not.
            </p>
            <p className="hint-text">Posisi not pada garis atau ruang menentukan tinggi nada.</p>
          </div>
        </div>

        <div id="step2" className={`step-content${step === 2 ? ' active' : ''}`}>
          <h2>2. Mengenal Kunci G</h2>
          <MentorBubble
            pose={poseForStep(2)}
            text="Kunci G menunjukkan posisi nada pada paranada. Garis G biasanya ada di garis ke-2."
            active={step === 2}
          />
          <OrnateFrame className="ornate-frame--surface">
            <ClefArt id="treble-clef-svg" label="Ilustrasi kunci G yang menjulang melebihi paranada" />
          </OrnateFrame>
          <div className="explanation-container">
            <h3>Penjelasan Kunci G:</h3>
            <p>
              <strong>Fungsi:</strong> Menunjukkan nada G pada paranada (posisi garis ke-2).
            </p>
            <p>
              <strong>Penggunaan:</strong> Untuk membaca posisi not pada paranada dengan benar.
            </p>
            <p className="hint-text">Kunci G adalah yang paling sering digunakan dalam musik modern.</p>
          </div>
        </div>

        <div id="step3" className={`step-content${step === 3 ? ' active' : ''}`}>
          <h2>3. Mengenal Not</h2>
          <MentorBubble
            pose={poseForStep(3)}
            text="Geser notnya. Not berpindah ke garis dan ruang paranada. Dengarkan perubahan nada!"
            active={step === 3}
          />
          <OrnateFrame className="ornate-frame--surface">
            <svg
              ref={staffRef}
              className={`paranada-svg paranada-svg--draggable${isDragging ? ' is-dragging' : ''}`}
              viewBox="0 0 400 160"
              id="note-staff"
              role="group"
              aria-label="Paranada dengan not yang dapat digeser"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              <StaffLines />
              {/* Hit area transparan agar not lebih mudah dijangkau (terutama di layar sentuh) */}
              <circle className="note-hit" cx="200" cy={noteY} r="28" aria-hidden="true"></circle>
              <ellipse
                id="svg-note"
                className="note-ellipse"
                cx="200"
                cy={noteY}
                rx="14"
                ry="10"
                transform={`rotate(-15 200 ${noteY})`}
                tabIndex={0}
                role="slider"
                aria-label="Posisi not pada paranada"
                aria-valuemin={0}
                aria-valuemax={8}
                aria-valuenow={pitchIndex}
                aria-valuetext={level.label}
                onKeyDown={handleNoteKeyDown}
                onPointerDown={primeAudio}
              ></ellipse>
            </svg>
          </OrnateFrame>
          {/* Kontrol cadangan untuk keyboard/screen reader — tersembunyi secara visual */}
          <input
            type="range"
            id="note-pitch"
            min="0"
            max="8"
            step="1"
            value={pitchIndex}
            className="note-slider-input note-slider-sr-only"
            tabIndex={-1}
            aria-label="Pilih posisi not pada paranada"
            aria-valuetext={level.label}
            onChange={(e) => changePitch(Number(e.target.value))}
          />
          <p id="pitch-info" className="pitch-info-text" aria-live="polite">
            {level.label}
          </p>
        </div>

        <div className="controls">
          <button id="btnPrev" className="btn-secondary" onClick={handlePrev} disabled={isFirstStep(step)}>
            Kembali
          </button>
          <button id="btnNext" className="btn-primary" onClick={handleNext}>
            {nextButtonLabel(step)}
          </button>
        </div>
      </div>

      <HudIntro />
    </div>
  );
};
