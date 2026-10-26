/**
 * KONFIGURASI MOTION MASKOT — satu-satunya tempat mengubah pose, timing, dan
 * warna. Semua nilai di bawah dipakai oleh useMascotScroll (timeline scrub) dan
 * MascotStage (layer fixed).
 *
 * Satuan pose:
 *   x      : offset horizontal dari TENGAH layar, dalam vw  (positif = kanan)
 *   y      : offset vertikal dari tengah layar, dalam vh    (positif = bawah)
 *   scale  : pengali terhadap --mascot-size (tinggi maskot, default 58vh)
 *   rotX   : derajat rotateX (kesan 3D, butuh perspective — sudah diset CSS)
 *   rotZ   : derajat rotateZ (positif = searah jarum jam)
 *   opacity: 0..1
 *
 * "showcase" memakai `hug` (fraksi terhadap kotak foto, bukan vw/vh) supaya
 * maskot selalu menempel tepat pada frame foto berapa pun lebar layarnya:
 *   hug.x  : posisi maskot di sumbu X foto (0 = tepi kiri foto, 1 = tepi kanan)
 *   hug.y  : posisi maskot di sumbu Y foto (0 = tepi atas foto)
 */

export interface PhasePose {
  x?: number;
  y?: number;
  scale?: number;
  rotX?: number;
  rotZ?: number;
  opacity?: number;
  /** Hanya fase showcase: posisi relatif terhadap frame foto. */
  hug?: {
    x: number;
    y: number;
    /**
     * `'right'` = `hug.x` diartikan sebagai posisi TEPI badan maskot (bukan
     * pusatnya) relatif terhadap lebar foto — `'right'` memakai tepi KIRI
     * badan, `'left'` memakai tepi KANAN badan. Dipakai supaya maskot benar
     * benar berdiri DI SAMPING foto: dengan mode pusat (bawaan lama), pusat
     * maskot duduk di dalam kotak foto dan badannya menutupi kartu mockup
     * (terbukti di QA).
     */
    edge?: 'right' | 'left';
    /** Jarak tepi badan ke titik `hug.x` pada mode `edge` (px). */
    gap?: number;
    /**
     * `'section'` = `hug.y` diukur dari TEPI BAWAH section (bukan dari tepi
     * atas foto). Dipakai Showcase desktop: pita bebas di kolom kiri berada di
     * BAWAH daftar langkah, dan posisinya lebih stabil diukur dari dasar
     * section daripada dari foto yang tingginya berubah tiap lebar layar.
     */
    anchorY?: 'section';
    /** Jarak pusat badan ke tepi acuan `anchorY` (vh). */
    offsetY?: number;
  };
  /**
   * Pose non-hug yang dibatasi supaya AABB terrotasinya selalu ≥16px di
   * dalam tepi layar. Ukuran maskot berbasis vh tidak ikut mengecil saat
   * viewport sempit (1024–1280), sementara posisi vw ikut menyusut — tanpa
   * clamp ini maskot bisa terpotong tepi kanan/atas di layar non-desain.
   */
  clamp?: boolean;
  /**
   * Hindari-teks: ukur elemen `sel` saat refresh, lalu dorong pose pada
   * `axis` supaya AABB terrotasi maskot tidak pernah menimpanya (margin
   * `gap` px). `text: true` mengukur rect GLIF teks (heading selebar kolom
   * tidak dihitung sebagai teks penuh). Bila ruang secara fisik tidak muat
   * (viewport sempit), skala diturunkan bertahap sampai muat (min 0.34).
   * Nilai x/y hasil akhir tetap di-clamp 16px di dalam tepi layar.
   */
  avoid?: { sel: string; axis: 'x' | 'y'; side: 'left' | 'right' | 'top' | 'bottom'; gap: number; text?: boolean };
  /**
   * Rekatkan-tepi: hitung `x` dari kotak elemen `sel` supaya TEPI badan
   * maskot selalu berhenti tepat `gap` px dari tepi kotak itu, berapa pun
   * lebar layarnya.
   *
   * `avoid` hanya MENDORONG jauh (tidak pernah menarik mendekat), jadi pada
   * lebar besar maskot berhenti di posisi vw mentah — jauh dari panel. Mode
   * ini dipakai pose `finale` desktop: `x` dijepit persis di sebelah kanan
   * panel CTA memakai jarak yang tetap (≈48px di semua lebar).
   *
   * Urutan hitung: skala dulu (termasuk auto-turun bila ruang kurang), lalu
   * posisi anchor, lalu clamp tepi layar.
   *   edge 'right' = badan di KANAN elemen  (maskot menempel sisi kanan panel)
   *   edge 'left'  = badan di KIRI elemen
   * `clampY`/`gapX` menggeser hasil akhir dalam px (bila perlu).
   *
   * `glyphInset: true` menghitung ulang jarak memakai MARGIN KOSONG di dalam
   * kotak maskot: gambar (glif SVG) tidak memenuhi kotak persegi `body`, jadi
   * `gap` yang diukur dari tepi kotak terlihat jauh lebih lebar dari yang
   * dimaksud (terukur ~60px inset → celah terlihat 114–163px untuk gap 48).
   * Dengan opsi ini, `gap` = celah yang BENAR-BENAR TERLIHAT ke glif.
   */
  anchor?: { sel: string; edge: 'left' | 'right'; gap: number; glyphInset?: boolean };
}

export interface PoseSet {
  /** Ukuran dasar maskot (tinggi) dalam satuan CSS. */
  size: string;
  hero: PhasePose;
  manifesto: PhasePose;
  /** Titik tengah transit Fase 3 (kiri → kanan, rebah + rotateX). */
  transit: PhasePose;
  showcase: PhasePose;
  /** Saat maskot keluar layar menuju penutup (Fase 5). */
  exit: PhasePose;
  /** Posisi akhir di penutup (Fase 6). */
  finale: PhasePose;
  /**
   * Jangkar bubble Manifesto.
   *
   * `mode: 'body'` (dipakai sekarang) menghitung anchor dari KOTAK BADAN
   * maskot pada pose yang sedang aktif, bukan dari tengah layar: dengan
   * konstanta vw/vh, balon selalu bertumpuk badan (terbukti di QA) dan ekornya
   * menunjuk ruang kosong karena posisi maskot berbeda tiap breakpoint.
   *
   *   side : sisi balon terhadap badan — 'right' = balon di kanan badan
   *          (ekor balon menunjuk ke KIRI, ke arah kepala/torso),
   *          'top' = balon di atas badan (dipakai di layar sempit).
   *   tail : sisi balon tempat EKOR berada — 'left' | 'right' | 'bottom'.
   *          Harus menghadap badan supaya ekornya menunjuk maskot.
   *   dy   : offset vertikal pusat balon dari pusat badan, satuan vh.
   *   gap  : jarak minimum tepi balon ke tepi badan (px).
   *
   * Bila `mode` tidak diisi, nilai x/y absolut lama tetap dipakai (fallback).
   */
  bubble: {
    x: number;
    y: number;
    mode?: 'body';
    side?: 'left' | 'right' | 'top';
    tail?: 'left' | 'right' | 'bottom';
    dy?: number;
    gap?: number;
  };
}

export const MASCOT_SIZE_DESKTOP = '58vh';
export const MASCOT_SIZE_MOBILE = '42vh';

export const POSES_DESKTOP: PoseSet = {
  size: MASCOT_SIZE_DESKTOP,
  // Fase 1 — di STRIP KANAN judul: posisi x 37 adalah titik nyaman di 1440,
  // tapi clamp viewport menarik maskot ke kiri pada 1024–1200 sampai menyenggol
  // glif "Basicmelody." — karena itu hero memakai `avoid` terhadap h1: x dihitung
  // dari tepi kanan glif asli (bukan lebar desain), jadi bersih di segala lebar;
  // bila tetap mustahil muat, skala mengecil otomatis.
  hero: {
    x: 37,
    y: -20,
    scale: 0.58,
    rotX: 0,
    rotZ: -4,
    opacity: 1,
    clamp: true,
    avoid: { sel: '#section-1 h1', axis: 'x', side: 'right', gap: 24, text: true },
  },
  // Fase 2 — kiri-bawah: seluruh konten Manifesto (judul, panel, caption)
  // pindah ke kolom kanan (col-start-6), jadi kiri bebas untuk maskot yang
  // kini boleh lebih besar dan berdiri tegak (skala 0.58, y 14). `avoid`
  // mengunci tepi kanan badan sebelum kolom konten mulai.
  manifesto: {
    x: -30,
    y: 14,
    scale: 0.58,
    rotX: 0,
    rotZ: -18,
    opacity: 1,
    clamp: true,
    avoid: { sel: '[data-manifesto-content]', axis: 'x', side: 'left', gap: 24 },
  },
  // Fase 3 — titik tengah transit: rebah ringan + terlihat dari atas. Nilai
  // dimiringkan dari prototipe awal (rotZ -70/rotX 30) karena kombinasi itu
  // membuat SVG datar terlihat "pipih aneh" saat dibalik arah gulir; -30/12
  // tetap terasa dinamis + blur tapi bentuknya tetap terbaca.
  // Jalurnya melengkung (bukan garis lurus manifesto → showcase): titik ini
  // digeser ke KIRI-BAWAH jalur supaya maskot "turun dulu, lalu melengkung
  // ke atas" — lurus membuat pose terlihat miring mendadak saat gulir naik.
  transit: { x: -20, y: 30, scale: 0.7, rotX: 12, rotZ: -30, opacity: 1 },
  // Fase 4 — besar di kanan, memeluk pojok frame foto.
  // Fase 4 — di KIRI kartu, memeluk tepi kiri foto: `edge:'left'` membuat
  // `hug.x = 0` berarti TEPI KANAN badan maskot tepat di tepi kiri foto
  // (−gap), bukan pusatnya (mode pusat x 0.74 dulu menaruh badan DI DALAM
  // kotak foto dan menutupi kartu mockup — terbukti QA).
  // Pita bebas di kolom kiri = antara daftar langkah (atas) dan judul+deskripsi
  // langkah aktif (bawah), dan pita itu sempit serta TIDAK proporsional dengan
  // tinggi foto: dengan hug.y dari atas foto tidak ada satu nilai pun yang aman
  // di semua lebar (jendela amannya saling meniadakan). Karena itu sumbu Y
  // diukur dari DASAR SECTION (anchorY 'section'): offsetY NEGATIF menarik
  // maskot NAIK dari dasar viewport. −57vh dipilih dari irisan jendela aman
  // 1024/1152/1280/1366/1440 (batas ketat: ≥8px di bawah daftar langkah dan
  // ≥8px di atas judul langkah aktif); 1920 juga terpenuhi karena tidak ada
  // batas atas di sana. −56 sempat menyisakan 3px ke padding bawah `<ol>`.
  // Skala 0.34: deskripsi langkah melebar sampai x≈430 sementara tepi kiri foto
  // di x≈633 — hanya ~200px tersisa, jadi maskot HARUS sekecil ini agar tidak
  // menyentuh teks. gap 24 untuk AABB terrotasi (rotZ −14°).
  showcase: {
    hug: { x: 0, y: 0, edge: 'left', gap: 24, anchorY: 'section', offsetY: -57 },
    scale: 0.34,
    rotX: 4,
    rotZ: -14,
    opacity: 1,
  },
  // Fase 5 — keluar ke bawah kanan sambil memudar (rotZ 32, bukan 45:
  // miring ekstrem terlihat berlebihan saat scroll ditarik cepat ke atas).
  exit: { x: 16, y: 58, scale: 0.8, rotX: 0, rotZ: 32, opacity: 0 },
  // Fase 6 — masuk dari bawah, berhenti di TEPI KANAN PANEL CTA: h2 "Siap
  // mulai dari nada pertama?" tetap di kiri (col-span-4), panel CTA di tengah
  // (col-start-5 col-span-4, ekor mengarah kanan ke maskot). `anchor`
  // mengunci TEPI KIRI badan tepat 48px di kanan tepi panel, jadi jaraknya
  // SAMA di 1024 → 1920 (dengan `x` vw lama, jaraknya melebar 55 → 262px
  // karena panel mengikuti kolom grid sementara `x` mengikuti lebar layar).
  // `clamp: true` tetap dipakai agar layar sempit tidak memotong badan;
  // `avoid` tidak diperlukan lagi karena posisi sudah dikunci anchor.
  finale: {
    y: -4,
    scale: 0.66,
    rotX: 0,
    rotZ: -20,
    opacity: 1,
    clamp: true,
    anchor: { sel: '.cta-panel', edge: 'right', gap: 48, glyphInset: true },
  },
  // Bubble Manifesto: menempel ke KOTAK BADAN maskot pose `manifesto`.
  // Desktop punya ruang kosong luas di ATAS maskot, sedangkan di sampingnya
  // tidak: badan berakhir di x≈479 sementara kolom konten mulai di x≈633,
  // jadi balon 480px tidak muat di celah itu (menimpa panel — terbukti QA).
  // Karena itu desktop juga memakai `side:'top'`: balon melayang di atas
  // kepala, ekornya di tepi bawah menunjuk ke maskot.
  bubble: { x: 0, y: 0, mode: 'body', side: 'top', tail: 'bottom', dy: 0, gap: 16 },
};

export const POSES_MOBILE: PoseSet = {
  size: MASCOT_SIZE_MOBILE,
  // Hero & Manifesto & Penutup mobile: konten memenuhi lebar layar, jadi
  // yang bisa dikosongkan hanya ZONA BAWAH konten. `avoid` axis-y mengukur
  // kotak konten asli (grid hero, kolom manifesto, grid CTA) dan menurunkan
  // maskot — plus mengecilkan skala otomatis di HP pendek — supaya tidak
  // pernah menimpa teks berapa pun tinggi layarnya.
  hero: {
    x: 16,
    y: 30,
    scale: 0.62,
    rotX: 0,
    rotZ: -3,
    opacity: 1,
    clamp: true,
    avoid: { sel: '[data-hero-foot]', axis: 'y', side: 'bottom', gap: 24 },
  },
  // Manifesto mobile: konten section setinggi hampir satu layar, jadi tidak
  // ada "zona bawah" (avoid axis-y di sini justru menempelkan maskot ke tepi
  // bawah dan tetap menimpa caption). Yang dipakai: susunan bertumpuk di
  // posisi baca (T1 selesai ≈ section-2 top di 55% layar):
  //   balon di atas → maskot di tengah → konten di bawah.
  // y -2 menaruh badan di ~332–478 (390×844) — tepat di antara balon dan
  // judul yang mulai di ~522. clamp tetap aktif untuk layar sangat pendek.
  manifesto: {
    x: -14,
    y: -2,
    scale: 0.5,
    rotX: 0,
    rotZ: -14,
    opacity: 1,
    clamp: true,
  },
  transit: { x: -14, y: 22, scale: 0.55, rotX: 12, rotZ: -30, opacity: 1 },
  // Hug foto mobile: foto memakai lebar penuh, jadi tidak ada ruang di samping
  // — maskot tetap menempel di sisi ATAS foto (y 0.02). Sumbu X-nya dijaga di
  // sisi KIRI foto (x 0.06) supaya badannya tidak duduk di atas judul kartu.
  showcase: { hug: { x: 0.06, y: 0.02 }, scale: 0.42, rotX: 4, rotZ: 12, opacity: 1 },
  exit: { x: 10, y: 60, scale: 0.6, rotX: 0, rotZ: 30, opacity: 0 },
  finale: {
    x: 18,
    y: 34,
    scale: 0.45,
    rotX: 0,
    rotZ: -14,
    opacity: 1,
    clamp: true,
    avoid: { sel: '[data-cta-grid]', axis: 'y', side: 'bottom', gap: 24 },
  },
  // Bubble mobile: juga menempel ke badan. Di HP kolom konten memakai lebar
  // penuh, jadi tidak ada ruang di samping — balon naik ke ATAS badan (side
  // 'top'), ekornya di tepi BAWAH menunjuk kepala maskot. gap 12 menjaga
  // dasar balon selalu berakhir di atas kepala berapa pun jumlah barisnya.
  bubble: { x: 0, y: 0, mode: 'body', side: 'top', tail: 'bottom', dy: 0, gap: 12 },
};

/** Warna glow/aksen per langkah Showcase (dari palet pastel halaman). */
export const STEP_ACCENTS: readonly string[] = ['#8ea0e6', '#f7b394', '#eba3b8'];

/* ---- Timing (dipakai sebagai parameter tween, satuan: skala progres scrub) ---- */
export const TIMING = {
  /** Scrub smoothing untuk gerak utama maskot. */
  scrub: 0.7,
  /** Blur fase (px) saat transit kiri→kanan pada Fase 3. */
  transitBlur: 5,
  /** Blur maksimum dari kecepatan scroll (px) — sengaja kecil: blur besar
   *  membuat siluet datar terlihat "meleber aneh" saat scroll ditarik cepat
   *  ke atas. */
  maxVelocityBlur: 4,
  /** Smear vertikal maksimum pada headline (px). */
  maxSmear: 4,
  /** Durasi glitch judul Showcase (ms). */
  glitchMs: 380,
  /** Berapa px/frame scroll dianggap "cepat" untuk blur. */
  velocityBlurThreshold: 14,
  velocitySmearThreshold: 22,
};

/** Teks bubble yang diucapkan maskot saat berjalan ke Manifesto (Fase 2). */
export const MANIFESTO_BUBBLE =
  'Tiap nada punya nama, tempat, dan bunyi. Basicmelody menyusunnya jadi tiga langkah pendek: kenali dulu, ulangi sampai hafal, lalu uji dengan kuis. Tidak ada teori yang menumpuk sebelum kamu bisa memainkan sesuatu.';
