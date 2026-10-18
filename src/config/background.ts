/**
 * Konfigurasi latar not musik (MusicBackground).
 *
 * Landing page — beserta seluruh scane di dalamnya (intro, globe, Labs.,
 * manifesto, karya) — harus tetap polos, jadi path-nya masuk daftar pengecualian
 * di bawah. Halaman lain (Introduction, Level, dan route yang ditambahkan kelak)
 * otomatis memakai latar not.
 */
export const NO_MUSIC_BG_ROUTES = ['/'];

/** Durasi fade in/out latar saat berpindah halaman (detik). */
export const MUSIC_BG_FADE = 0.6;

/**
 * Rentang opasitas dasar not musik: not terkecil (paling jauh) → terbesar
 * (paling dekat). Sengaja rendah agar latar tidak mengganggu keterbacaan.
 * Nilai minimum dibiarkan di atas luminansi grid supaya not kecil tetap terlihat.
 */
export const MUSIC_BG_OPACITY = { min: 0.08, max: 0.26 } as const;
