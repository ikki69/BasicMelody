import { useCallback, useEffect, useRef, type RefObject } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { POSES_DESKTOP, POSES_MOBILE, TIMING, type PhasePose, type PoseSet } from '../config/mascotMotion';

gsap.registerPlugin(ScrollTrigger);

/** Elemen DOM stage yang dipegang oleh timeline (diisi MascotStage lewat ref). */
export interface MascotParts {
  body: HTMLDivElement | null;
  glow: HTMLDivElement | null;
  wipe: HTMLDivElement | null;
  bubbleAnchor: HTMLDivElement | null;
}

/**
 * Proxy state: SEMUA pose maskot hidup di objek ini, digerakkan oleh tween
 * scrub, lalu diterapkan ke DOM lewat satu fungsi apply() (transform + opacity
 * + filter saja — tidak ada layout property sama sekali).
 */
export interface MascotState {
  x: number;
  y: number;
  scale: number;
  /**
   * Pengali scaleY untuk squash-pop (1 = normal). Dipakai `pulse()` saat
   * ganti pose Showcase: badan memipih sebentar lalu memantul kembali —
   * menggantikan flip rotY 360° yang membuat SVG datar terlihat tipis
   * (edge-on) lalu terbalik (mirror) saat scroll ditarik cepat ke atas.
   */
  squashY: number;
  rotX: number;
  rotZ: number;
  rotY: number;
  opacity: number;
  /** Blur dari timeline Fase 3 (px). */
  blur: number;
  /** Blur dari kecepatan scroll (px) — digabung Math.max dengan blur fase. */
  velBlur: number;
  glowA: number;
  bubbleA: number;
  /** Posisi anchor bubble (vw/vh dari tengah layar). */
  bx: number;
  by: number;
}

export interface MascotMotion {
  parts: RefObject<MascotParts>;
  apply: () => void;
  /** Tampilkan/sembunyikan bubble Manifesto (Fase 2). */
  setBubble: (on: boolean) => void;
  /** Squash-pop: badan memipih lalu memantul; onMid dipanggil di titik pipih (untuk ganti pose). */
  pulse: (onMid: () => void) => void;
}

const vw = (n: number) => (window.innerWidth * n) / 100;
const vh = (n: number) => (window.innerHeight * n) / 100;

/**
 * Rect GLIF teks, bukan kotak blok. Heading display (h1/h2) selebar kolom
 * padahal teksnya pendek — memakai kotak blok membuat `avoid` menyangka
 * maskot harus menghindari seluruh kolom (maskot mengecil ekstrem).
 */
const textRect = (el: HTMLElement): { left: number; right: number; top: number; bottom: number } => {
  const range = document.createRange();
  range.selectNodeContents(el);
  const rs = [...range.getClientRects()].filter((r) => r.width > 1 && r.height > 1);
  if (!rs.length) return el.getBoundingClientRect();
  return {
    left: Math.min(...rs.map((r) => r.left)),
    right: Math.max(...rs.map((r) => r.right)),
    top: Math.min(...rs.map((r) => r.top)),
    bottom: Math.max(...rs.map((r) => r.bottom)),
  };
};

/**
 * Celah NYATA dari tepi KOTAK `body` ke tepi kiri/kanan GAMBAR maskot, dalam
 * satuan px pada UKURAN DASAR (sudah dibagi skala pose) — jadi pemanggil cukup
 * mengalikannya dengan skala yang sedang dipakai.
 *
 * Diukur dari rect ter-render supaya rotasi pose ikut terhitung (rotZ membuat
 * sudut glif keluar dari kotak), lalu dinormalkan: `rect.width` pada elemen
 * ter-rotasi adalah AABB, bukan sisi kotak, jadi pembaginya memakai
 * `offsetWidth × skala` (sisi kotak sesungguhnya).
 *
 * PENTING: hanya valid bila dipanggil saat ARTWORK POSE yang benar sudah
 * ter-commit di DOM (pose ditukar dengan `pulse`, lalu MascotStage memanggil
 * `ScrollTrigger.refresh()` sehingga nilai pose berupa fungsi dihitung ulang
 * setelah tukar itu).
 */
const glyphInsets = (body: HTMLElement): { left: number; right: number } => {
  const br = body.getBoundingClientRect();
  if (!br.width || !body.offsetWidth) return { left: 0, right: 0 };
  const m = new DOMMatrixReadOnly(getComputedStyle(body).transform);
  const scale = Math.hypot(m.a, m.b) || 1;
  const side = body.offsetWidth * scale;
  if (!side) return { left: 0, right: 0 };
  const shapes = body.querySelectorAll<SVGGraphicsElement>(
    'path,circle,ellipse,rect,line,polygon,polyline'
  );
  let min = Infinity;
  let max = -Infinity;
  for (const s of shapes) {
    if (s.closest('defs,clipPath,mask,marker,pattern,symbol')) continue;
    const r = s.getBoundingClientRect();
    if (!r.width && !r.height) continue;
    min = Math.min(min, r.left);
    max = Math.max(max, r.right);
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) return { left: 0, right: 0 };
  const cap = (v: number) => Math.max(0, Math.min(0.45, v / scale / body.offsetWidth));
  return { left: cap(min - br.left), right: cap(br.right - max) };
};

/**
 * Hitung pose akhir (x, y, skala) untuk pose non-hug: clamp tepi layar +
 * hindari-teks (PhasePose.clamp / PhasePose.avoid). Dipakai dua tempat:
 * nilai fungsi tween (dievaluasi saat refresh) dan penerapan langsung pose
 * hero saat refresh di scroll 0 — keduanya harus memakai rumus yang sama.
 */
const fitPose = (p: PhasePose, body: HTMLElement) => {
  const vw2 = window.innerWidth / 2;
  const vh2 = window.innerHeight / 2;
  const baseX = p.x !== undefined ? vw(p.x) : 0;
  const baseY = p.y !== undefined ? vh(p.y) : 0;
  let sc = p.scale ?? 1;
  const av = p.avoid;
  const el = av ? document.querySelector<HTMLElement>(av.sel) : null;
  const r = el ? (av?.text ? textRect(el) : el.getBoundingClientRect()) : undefined;
  // Setengah sisi AABB badan SETELAH rotasi rotZ: kotak sisi offsetWidth
  // dirotasi → (cos+sin)/2 × sisi × skala. Tanpa faktor ini, rotasi membuat
  // sudut badan terpotong tepi layar meski posisi "biasa" terasa aman.
  const halfAt = (s: number) => {
    const rz = (Math.abs(p.rotZ ?? 0) * Math.PI) / 180;
    return (body.offsetWidth * s * (Math.cos(rz) + Math.sin(rz))) / 2;
  };

  // 1) Hindari-teks: bila ruang pada sumbu yang ditentukan tidak muat untuk
  //    AABB berukuran penuh, turunkan skala bertahap (min 0.34) sampai muat
  //    antara teks dan tepi layar.
  if (av && r) {
    for (let i = 0; i < 14 && sc > 0.34; i++) {
      const h = halfAt(sc);
      const roomOk =
        av.axis === 'x'
          ? av.side === 'right'
            ? r.right + av.gap + 2 * h <= window.innerWidth - 16
            : r.left - av.gap - 2 * h >= 16
          : av.side === 'bottom'
            ? r.bottom + av.gap + 2 * h <= window.innerHeight - 16
            : r.top - av.gap - 2 * h >= 16;
      if (roomOk) break;
      sc = Math.max(0.34, Math.round((sc - 0.05) * 100) / 100);
    }
  }

  // 1b) Rekatkan-tepi (`anchor`): butuh RUANG di dua sisi sekaligus — `gap`
  //    px di kiri badan (dari tepi kotak `sel`) DAN margin 16px di tepi layar
  //    kanan. Pada 1024–1152 ruang itu tidak cukup untuk skala 0.66, jadi
  //    skala diturunkan bertahap persis seperti `avoid` (min 0.5: di bawah itu
  //    maskot jadi terlalu kecil untuk dibaca sebagai "maskot penutup").
  //    Saat `glyphInset`, `gap` diukur ke GAMBAR maskot, bukan tepi kotaknya:
  //    margin kosong di dalam kotak (`insetFrac` × lebar kotak) ditambahkan ke
  //    jarak kotak, sehingga celah yang terlihat tetap `gap` px.
  const an = p.anchor;
  const anEl = an ? document.querySelector<HTMLElement>(an.sel) : null;
  const anRect = an && anEl ? anEl.getBoundingClientRect() : undefined;
  const insetFrac = an?.glyphInset ? glyphInsets(body)[an.edge === 'right' ? 'left' : 'right'] : 0;
  /**
   * Jarak dari tepi acuan ke tepi KOTAK badan (px, skala-aware).
   *
   * Celah yang diinginkan diukur ke GAMBAR, sedangkan posisi dikunci di tepi
   * KOTAK. Untuk maskot di KANAN acuan (`edge:'right'`), sisi kotak yang
   * menghadap acuan adalah KIRI, dan gambar mulai `insetFrac` × lebar kotak di
   * dalam kotak — jadi kotak harus ditarik MAJU (lebih dekat ke acuan) sebesar
   * margin itu, bukan dimundurkan: `gap_box = gap − inset`.
   *
   * Hasilnya BOLEH NEGATIF: bila margin kosong lebih besar dari `gap`, tepi
   * kotak memang harus masuk sedikit ke area acuan — yang bertumpuk hanya
   * ruang kosong, gambarnya tetap `gap` px dari tepi acuan. Ini disengaja dan
   * aman karena kotak maskot tidak pernah menutupi isi panel (QA: 0 irisan
   * tombol/judul/paragraf).
   */
  const anchorGap = () => {
    if (!an) return 0;
    const inset = insetFrac * body.offsetWidth * sc;
    return an.gap - inset;
  };
  if (an && anRect) {
    // Lebar kotak AABB yang tersedia untuk badan: dari tepi acuan `sel` (+gap)
    // sampai tepi layar tujuan (−16). `h` harus ≤ setengah lebar itu.
    const room =
      an.edge === 'right'
        ? window.innerWidth - 16 - (anRect.right + anchorGap())
        : anRect.left - anchorGap() - 16;
    for (let i = 0; i < 14 && sc > 0.5; i++) {
      if (2 * halfAt(sc) <= room) break;
      sc = Math.max(0.5, Math.round((sc - 0.02) * 100) / 100);
    }
  }

  // 2) Rekatkan-tepi (`anchor`): kunci TEPI badan `gap` px dari tepi kotak
  //    `sel` — dipakai pose finale desktop supaya jarak panel → maskot sama
  //    di semua lebar. Dihitung SETELAH skala final diketahui.
  const h = halfAt(sc);
  let x: number;
  let y: number;
  const inX = (val: number) => Math.min(vw2 - 16 - h, Math.max(-vw2 + 16 + h, val));
  const inY = (val: number) => Math.min(vh2 - 16 - h, Math.max(-vh2 + 16 + h, val));
  if (an && anRect) {
    // Posisi pusat badan (koordinat stage = offset dari tengah layar).
    const g = anchorGap();
    const edge = an.edge === 'right' ? anRect.right + g + h : anRect.left - g - h;
    x = inX(edge - vw2);
    y = inY(baseY);
  } else {
    x = inX(baseX);
    y = inY(baseY);
  }

  // 3) Dorong menjauh dari teks pada sumbu hindar, lalu clamp ulang: bila
  //    ruang benar-benar habis, menempel tepi layar lebih baik daripada
  //    menimpa teks atau keluar layar.
  if (av && r) {
    if (av.axis === 'x') {
      x = av.side === 'right' ? Math.max(x, r.right + av.gap + h - vw2) : Math.min(x, r.left - av.gap - h - vw2);
      x = inX(x);
    } else {
      y = av.side === 'bottom' ? Math.max(y, r.bottom + av.gap + h - vh2) : Math.min(y, r.top - av.gap - h - vh2);
      y = inY(y);
    }
  }
  return { x, y, sc };
};

/**
 * Posisi anchor balon (bx, by) dalam koordinat stage — yaitu offset dari
 * TENGAH layar, sama seperti transform maskot (`apply()` memakai gsap.set
 * pada elemen anchor yang `left/top: 50%`).
 *
 * `mode: 'body'` menghitung dari Kotak badan maskot yang SEDANG aktif: balon
 * selalu menempel (gap px) di sisi `side` badan, jadi tidak pernah menimpa
 * badan dan tidak pernah menunjuk ruang kosong. Dipakai setelah pose fase
 * diterapkan, sehingga ikut berubah saat refresh/resize.
 */
/** Ukuran kotak balon yang SEDANG tampil (diukur dari DOM, bukan dihitung). */
const BUBBLE_BOX = () => {
  const el = document.querySelector<HTMLElement>('.mascot-stage__bubble');
  return { w: el ? el.offsetWidth : 300, h: el ? el.offsetHeight : 120 };
};

const bubbleAnchorFor = (P: PoseSet, body: HTMLElement, s: MascotState): { bx: number; by: number } => {
  const b = P.bubble;
  if (b.mode !== 'body') return { bx: vw(b.x), by: vh(b.y) };

  // Anchor = sudut KIRI-ATAS kotak balon (lihat .mascot-stage__bubble).
  const halfW = (body.offsetWidth * s.scale) / 2;
  const halfH = (body.offsetHeight * s.scale) / 2;
  const gap = b.gap ?? 14;
  const dy = vh(b.dy ?? 0);
  const { w: bw, h: bh } = BUBBLE_BOX();
  const vw2 = window.innerWidth / 2;
  const vh2 = window.innerHeight / 2;
  // Balon tidak boleh keluar layar meski badannya menempel tepi (HP): sudut
  // kiri-atasnya di-clamp supaya seluruh kotak balon tetap di dalam viewport.
  const clampX = (v: number) => Math.min(vw2 - 10 - bw, Math.max(-vw2 + 10, v));
  const clampY = (v: number) => Math.min(vh2 - 10 - bh, Math.max(-vh2 + 10, v));
  if (b.side === 'top') {
    // Balon di ATAS badan, dipusatkan pada sumbu X maskot; dasarnya berhenti
    // `gap` di atas kepala maskot.
    return { bx: clampX(s.x - bw / 2), by: clampY(s.y - halfH - gap - bh + dy) };
  }
  const shift = halfW + gap;
  const bx = b.side === 'left' ? s.x - shift - bw : s.x + shift;
  return { bx: clampX(bx), by: clampY(s.y + dy - bh / 2) };
};

/** Pose awal (Fase 1) sesuai breakpoint saat ini. */
const initState = (): MascotState => {
  const P = window.innerWidth >= 1024 ? POSES_DESKTOP : POSES_MOBILE;
  return {
    x: vw(P.hero.x ?? 0),
    y: vh(P.hero.y ?? 0),
    scale: P.hero.scale ?? 1,
    squashY: 1,
    rotX: P.hero.rotX ?? 0,
    rotZ: P.hero.rotZ ?? 0,
    rotY: 0,
    opacity: P.hero.opacity ?? 1,
    blur: 0,
    velBlur: 0,
    glowA: 0,
    bubbleA: 0,
    bx: vw(P.bubble.x),
    by: vh(P.bubble.y),
  };
};

/**
 * Hook scroll utama maskot.
 *
 * Struktur:
 *  - T1 (section-2): hero → Manifesto (maskot ke kiri, mengecil, miring).
 *  - T2 (section-3): transit Fase 3 (miring tajam + rotateX + blur) → menempel
 *    pada frame foto Fase 4 (posisi dihitung dari kotak foto, jadi presisi di
 *    segala lebar layar).
 *  - T3 (section-4): keluar ke bawah (Fase 5) → masuk dari bawah ke pose
 *    penutup (Fase 6).
 *  - Wipe: satu blok warna penuh per batas babak, digambar dari progres scroll.
 *  - Ticker: blur kecepatan scroll + smear vertikal pada headline.
 *
 * Kembali ke atas = timeline mundur → pose, aksen, dan bubble ikut ter-reset
 * otomatis (Fase 7).
 */
export const useMascotScroll = (enabled: boolean): MascotMotion => {
  const parts = useRef<MascotParts>({ body: null, glow: null, wipe: null, bubbleAnchor: null });
  const state = useRef<MascotState>(initState());
  /** PoseSet aktif (desktop/mobile) — dipakai anchor balon relatif badan. */
  const poseSet = useRef<PoseSet>(window.innerWidth >= 1024 ? POSES_DESKTOP : POSES_MOBILE);

  const apply = useCallback(() => {
    const s = state.current;
    const { body, glow, bubbleAnchor } = parts.current;
    if (body) {
      // Balon (bila aktif) menempel pada KOTAK BADAN pada pose saat ini —
      // dihitung ulang tiap frame scrub, bukan sekali saat mount, karena
      // posisi badan berubah terus selama transisi. Saat MEMUDAR (bubbleA
      // turun) anchor tidak lagi dihitung: balon berhenti di posisinya lalu
      // menghilang di tempat, bukan "mengejar" badan yang sedang bergerak.
      if (s.bubbleA > 0.999) {
        const a = bubbleAnchorFor(poseSet.current, body, s);
        s.bx = a.bx;
        s.by = a.by;
      }
      gsap.set(body, {
        x: s.x,
        y: s.y,
        scaleX: s.scale,
        scaleY: s.scale * s.squashY,
        rotationX: s.rotX,
        rotationZ: s.rotZ,
        rotationY: s.rotY,
        opacity: s.opacity,
        force3D: true,
      });
      const b = Math.max(s.blur, s.velBlur);
      body.style.filter = b > 0.06 ? `blur(${b.toFixed(2)}px)` : '';
    }
    if (glow) gsap.set(glow, { x: s.x, y: s.y, opacity: s.glowA });
    if (bubbleAnchor) gsap.set(bubbleAnchor, { x: s.bx, y: s.by, autoAlpha: s.bubbleA });
  }, []);

  const setBubble = useCallback(
    (on: boolean) => {
      gsap.killTweensOf(state.current, 'bubbleA');
      gsap.to(state.current, {
        bubbleA: on ? 1 : 0,
        duration: 0.5,
        ease: 'power2.out',
        onUpdate: apply,
      });
    },
    [apply]
  );

  /**
   * Squash-pop (pengganti flip rotY 360°): badan scaleY 1 → 0.72 → 1 dalam
   * ~0.46s, pose SVG ditukar di titik paling pipih. Tanpa rotasi Y sama
   * sekali — siluet tidak pernah jadi "garis tipis" lalu "terbalik/mirror",
   * dan tidak bisa menumpuk saat scroll cepat melewati beberapa langkah.
   */
  const pulse = useCallback(
    (onMid: () => void) => {
      const st = state.current;
      gsap.killTweensOf(st, 'squashY');
      const tl = gsap.timeline({ onUpdate: apply });
      tl.to(st, { squashY: 0.72, duration: 0.16, ease: 'power2.in' }, 0);
      tl.call(onMid, [], 0.16);
      tl.to(st, { squashY: 1, duration: 0.3, ease: 'back.out(2.2)' }, 0.16);
    },
    [apply]
  );

  useEffect(() => {
    if (!enabled) return;

    apply(); // samakan DOM dengan state sejak frame pertama

    // ---- Entrance Fase 1 (di luar scrub supaya tidak berebut properti) ----
    const stageEl = document.querySelector('.mascot-stage');
    const entrance = stageEl
      ? gsap.fromTo(stageEl, { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 1, delay: 0.2, ease: 'power3.out' })
      : null;

    // ---- Blur kecepatan + smear headline (satu ticker) ----
    let lastY = window.scrollY;
    let velCur = 0;
    let smearCur = 0;
    let lastApplied = -1;
    let lastSmear = -1;
    const root = document.documentElement;

    const tick = () => {
      const y = window.scrollY;
      const raw = Math.abs(y - lastY);
      lastY = y;

      const targetB = raw > TIMING.velocityBlurThreshold ? Math.min(TIMING.maxVelocityBlur, (raw - TIMING.velocityBlurThreshold) * 0.18) : 0;
      velCur += (targetB - velCur) * 0.16;

      const targetS = raw > TIMING.velocitySmearThreshold ? Math.min(TIMING.maxSmear, (raw - TIMING.velocitySmearThreshold) * 0.15) : 0;
      smearCur += (targetS - smearCur) * 0.15;

      const b = Math.round(velCur * 20) / 20;
      if (b !== lastApplied) {
        lastApplied = b;
        state.current.velBlur = b;
        apply();
      }

      const s = Math.round(smearCur * 10) / 10;
      if (s !== lastSmear) {
        lastSmear = s;
        root.style.setProperty('--smear', String(s));
        root.classList.toggle('is-smearing', s > 0.2);
      }
    };
    gsap.ticker.add(tick);

    // ---- Bangun timeline sesuai breakpoint (diulang otomatis saat resize) ----
    const mm = gsap.matchMedia();

    const build = (P: PoseSet, mobile: boolean) => {
      const { body, glow, wipe, bubbleAnchor } = parts.current;
      const fig = document.querySelector<HTMLElement>('[data-figure]');
      const frame = document.querySelector<HTMLElement>('[data-frame]');
      if (!body || !glow || !bubbleAnchor || !fig) return;
      // Anchor balon mengikuti pose set breakpoint ini (desktop/mobile).
      poseSet.current = P;

      // Penanda siklus hidup build: callback `document.fonts.ready` bisa
      // selesai setelah unmount/breakpoint berganti — jangan sentuh state.
      let dead = false;

      const ctx = gsap.context(() => {
        const st = state.current;
        const section3 = fig.closest('section');

        /**
         * Ubah pose konfigurasi jadi vars tween (fungsi = nilai dihitung ulang
         * saat refresh). Kuncinya HARUS rotX/rotZ — nama field objek state —
         * bukan rotationX/rotationZ (itu properti DOM/GSAP; pada objek biasa
         * GSAP menolaknya dengan warning "Invalid property").
         */
        const poseVars = (p: PhasePose): gsap.TweenVars => {
          if (p.hug && section3) {
            const scale = p.scale ?? 1;
            const hug = p.hug;
            const w = () => body.offsetWidth * scale;
            // Setengah-lebar AABB maskot SETELAH rotasi: kotak body persegi
            // (sisi = offsetWidth) dirotasi rotZ → (cos+sin)/2 × sisi. Tanpa
            // faktor ini, rotZ 14° pada Fase 4 membuat sudut maskot terpotong
            // tepi kanan layar meski clamp "biasa" sudah merasa aman.
            const half = () => {
              const rz = (Math.abs(p.rotZ ?? 0) * Math.PI) / 180;
              return (body.offsetWidth * scale * (Math.cos(rz) + Math.sin(rz))) / 2;
            };
            return {
              scale,
              rotX: p.rotX ?? 0,
              rotZ: p.rotZ ?? 0,
              opacity: p.opacity ?? 1,
              // Kunci foto → posisi maskot; clamp supaya maskot tidak terpotong
              // tepi kiri/kanan/atas/bawah layar pada lebar berapa pun.
              // Mode `edge`: `hug.x` = posisi TEPI badan (bukan pusat), jadi
              // maskot berdiri di samping foto tanpa menutupi kartu mockup.
              x: () => {
                const fr = fig.getBoundingClientRect();
                const sr = section3.getBoundingClientRect();
                const anchorX = fr.left - sr.left + fr.width * hug.x;
                const g = hug.gap ?? 12;
                const edgeOffset =
                  hug.edge === 'right' ? g + w() / 2 : hug.edge === 'left' ? -g - w() / 2 : 0;
                const raw = anchorX + edgeOffset + (hug.edge ? 0 : w() / 2) - window.innerWidth / 2;
                const maxX = window.innerWidth / 2 - 16 - half();
                const minX = -window.innerWidth / 2 + 16 + half();
                return Math.min(maxX, Math.max(minX, raw));
              },
              y: () => {
                const fr = fig.getBoundingClientRect();
                const sr = section3.getBoundingClientRect();
                // anchorY 'section': ukur dari dasar section (pita bebas di
                // bawah daftar langkah), bukan dari atas foto.
                const base =
                  hug.anchorY === 'section'
                    ? sr.bottom - sr.top + vh(hug.offsetY ?? 0)
                    : fr.top - sr.top + fr.height * hug.y;
                const raw = base + w() / 2 - window.innerHeight / 2;
                // Batas vertikal sengaja LONGGAR (hanya mencegah maskot hilang
                // sepenuhnya di luar layar): pose showcase memang duduk di pita
                // sempit di dekat dasar section, dan clamp "harus utuh di dalam
                // layar" dulu memotong nilainya (terukur: raw 673 → terpotong
                // jadi 326 di 1440×900) sehingga maskot berhenti di tengah dan
                // menimpa daftar/deskripsi langkah.
                const maxY = window.innerHeight / 2 + half();
                const minY = -window.innerHeight / 2 - half();
                return Math.min(maxY, Math.max(minY, raw));
              },
            };
          }
          const v: gsap.TweenVars = {};
          if (p.x !== undefined) v.x = () => vw(p.x as number);
          if (p.y !== undefined) v.y = () => vh(p.y as number);
          if (p.scale !== undefined) v.scale = p.scale;
          if (p.rotX !== undefined) v.rotX = p.rotX;
          if (p.rotZ !== undefined) v.rotZ = p.rotZ;
          if (p.opacity !== undefined) v.opacity = p.opacity;

          // Clamp tepi layar + hindari-teks + rekatkan-tepi: nilai FUNGSI —
          // dihitung ulang saat refresh/resize (invalidateOnRefresh), bukan
          // tiap frame scrub.
          if (p.clamp || p.avoid || p.anchor) {
            if (p.anchor || v.x !== undefined) v.x = () => fitPose(p, body).x;
            if (v.y !== undefined) v.y = () => fitPose(p, body).y;
            if ((p.avoid || p.anchor) && v.scale !== undefined) v.scale = () => fitPose(p, body).sc;
          }
          return v;
        };

        // Reset ke pose Fase 1 + posisi bubble sesuai breakpoint, SEBELUM
        // timeline dibuat. Hero diterapkan lewat poseVars (bukan initState
        // mentah) supaya clamp/hindar-teks juga berlaku sejak scroll 0 —
        // tanpa ini, maskot di frame pertama memakai vw/vh mentah dan bisa
        // menimpa judul di viewport 1024–1200 (terbukti di QA).
        gsap.set(st, initState());
        gsap.set(st, poseVars(P.hero));
        apply();

        // ---------- Fase 1 → Fase 2: ke Manifesto ----------
        // Semua fase memakai fromTo (immediateRender:false) dengan titik awal
        // eksplisit = pose fase sebelumnya. Alasannya: beberapa trigger scrub
        // saling berdekatan dan berebut objek state yang sama; .to() merekam
        // "nilai awal" saat pertama dirender — bisa tercemar tengah animasi
        // lain. fromTo membuat progres 0 selalu idempoten (Fase 7 = reset
        // otomatis saat scroll naik juga ikut deterministik).
        gsap
          .timeline({
            defaults: { ease: 'none' },
            onUpdate: apply,
            scrollTrigger: {
              trigger: '#section-2',
              start: 'top bottom',
              // Mobile: section-2 jauh lebih pendek, jadi 'top 35%' selesai
              // SETELAH T2 mulai ('top bottom' section-3) — tidak ada jeda
              // tenang dan maskot menimpa konten saat dibaca. 'top 55%'
              // mengakhiri T1 lebih awal supaya ada jendela pose manifesto.
              end: mobile ? 'top 55%' : 'top 35%',
              scrub: TIMING.scrub,
              invalidateOnRefresh: true,
              // Pose hero diterapkan langsung saat refresh di scroll 0. Nilai
              // fungsi tween dievaluasi saat mount — ketika webfont belum
              // tentu siap (lebar glif h1 masih metrik fallback). Refresh
              // setelah font siap memakai metrik final; tanpa ini maskot
              // menempel judul di 1024px meski clamp sudah benar (terbukti QA).
              onRefresh: () => {
                if (Math.abs(window.scrollY) < 2) {
                  const hero = fitPose(P.hero, body);
                  st.x = hero.x;
                  st.y = hero.y;
                  st.scale = hero.sc;
                  st.rotX = P.hero.rotX ?? 0;
                  st.rotZ = P.hero.rotZ ?? 0;
                  st.opacity = P.hero.opacity ?? 1;
                }
                apply();
              },
            },
          })
          .fromTo(
            st,
            { ...poseVars(P.hero), glowA: 0, blur: 0 },
            { ...poseVars(P.manifesto), glowA: 0, blur: 0, duration: 1, immediateRender: false },
            0
          );

        // Pose hero sudah diterapkan ulang oleh onRefresh di atas. Cukup
        // segarkan ScrollTrigger sekali lagi setelah webfont siap supaya
        // semua nilai fungsi (clamp/avoid/hug) memakai metrik final.
        document.fonts?.ready.then(() => {
          if (dead) return;
          ScrollTrigger.refresh();
        });

        // ---------- Fase 3 → Fase 4: transit + menempel frame foto ----------
        const tl2 = gsap.timeline({
          defaults: { ease: 'none' },
          onUpdate: apply,
          scrollTrigger: {
            trigger: '#section-3',
            // Mobile: mulai lebih lambat ('top 85%') supaya tidak menabrak
            // jendela tenang Manifesto (lihat end T1) — section-3 mobile
            // masih tinggi sehingga 'top top' tetap tercapai.
            start: mobile ? 'top 85%' : 'top bottom',
            end: 'top top',
            scrub: TIMING.scrub,
            invalidateOnRefresh: true,
            onRefresh: apply,
          },
        });
        tl2.fromTo(
          st,
          { ...poseVars(P.manifesto), blur: 0, glowA: 0 },
          // Easing inOut (bukan power1.in linier): jalur manifesto → transit
          // melengkung halus di kedua ujungnya, jadi maskot tidak "menyentak"
          // miring saat arah gulir dibalik (S1).
          { ...poseVars(P.transit), blur: TIMING.transitBlur, glowA: 0.7, duration: 0.5, ease: 'power2.inOut', immediateRender: false },
          0
        );
        tl2.fromTo(
          st,
          { ...poseVars(P.transit), blur: TIMING.transitBlur, glowA: 0.7 },
          { ...poseVars(P.showcase), blur: 0, glowA: 1, duration: 0.5, ease: 'power2.inOut', immediateRender: false },
          0.5
        );
        if (frame) {
          tl2.to(frame, { autoAlpha: 1, scale: 1, duration: 0.35, ease: 'power2.out' }, 0.62);
        }

        // ---------- Fase 5 → Fase 6: keluar, lalu masuk dari bawah ----------
        const tl3 = gsap.timeline({
          defaults: { ease: 'none' },
          onUpdate: apply,
          scrollTrigger: {
            trigger: '#section-4',
            start: 'top bottom',
            // 'bottom bottom' = pose penutup TUNTAS tepat di akhir halaman,
            // berapa pun tinggi section penutup.
            end: 'bottom bottom',
            scrub: TIMING.scrub,
            invalidateOnRefresh: true,
            onRefresh: apply,
          },
        });
        tl3.fromTo(
          st,
          { ...poseVars(P.showcase), blur: 0, glowA: 1 },
          { ...poseVars(P.exit), blur: 3.5, glowA: 0, duration: 0.38, ease: 'power1.in', immediateRender: false },
          0
        );
        if (frame) tl3.to(frame, { autoAlpha: 0, duration: 0.15 }, 0.05);
        // Posisi "di bawah layar" — di sini opacity 0, jadi lompatannya tidak
        // terlihat; dipakai sebagai jembatan fromTo antara Fase 5 dan Fase 6.
        const below = {
          x: () => vw(P.finale.x ?? 0),
          y: () => vh(70),
          scale: P.finale.scale ?? 1,
          rotX: 0,
          rotZ: -8,
          opacity: 0,
          blur: 0,
          glowA: 0,
        };
        tl3.fromTo(st, { ...poseVars(P.exit), blur: 3.5, glowA: 0 }, { ...below, duration: 0.14, immediateRender: false }, 0.4);
        tl3.fromTo(st, { ...below }, { ...poseVars(P.finale), glowA: 0.55, blur: 0, duration: 0.46, ease: 'power2.out', immediateRender: false }, 0.54);

        // ---------- Wipe blok warna per batas babak ----------
        if (wipe) {
          const draw = (color: string, p: number) => {
            const s = p < 0.5 ? p * 2 : (1 - p) * 2;
            wipe.style.backgroundColor = color;
            wipe.style.transformOrigin = p < 0.5 ? 'bottom' : 'top';
            wipe.style.transform = `scaleY(${Math.min(1, s).toFixed(4)})`;
          };
          const hide = () => {
            wipe.style.transform = 'scaleY(0)';
          };
          // Batas terakhir (section-4) memakai 'bottom bottom': 'top top' tidak
          // pernah tercapai karena pin Spacer membuat top section-4 berhenti
          // ~72px di bawah atas layar → wipe pink akan macet menutupi 16%
          // layar atas di penutup. 'bottom bottom' = tuntas tepat di maxScroll.
          const boundaries: Array<[string, string, boolean]> = [
            ['#section-2', '#e6dccd', false], // sand
            ['#section-3', '#141414', false], // near-black
            ['#section-4', '#efd3da', true], // pink
          ];
          for (const [trigger, color, last] of boundaries) {
            ScrollTrigger.create({
              trigger,
              start: 'top bottom',
              end: last ? 'bottom bottom' : 'top top',
              onUpdate: (self) => draw(color, self.progress),
              onLeave: hide,
              onLeaveBack: hide,
              onRefresh: hide,
            });
          }
        }
      });

      return () => {
        dead = true;
        ctx.revert();
      };
    };

    mm.add('(min-width: 1024px)', () => build(POSES_DESKTOP, false));
    mm.add('(max-width: 1023px)', () => build(POSES_MOBILE, true));

    return () => {
      mm.revert();
      gsap.ticker.remove(tick);
      entrance?.kill();
      root.classList.remove('is-smearing');
      root.style.removeProperty('--smear');
    };
  }, [enabled, apply]);

  return { parts, apply, setBubble, pulse };
};
