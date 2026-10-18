import exploreImg from '../assets/media/app-eksplorasi.png';
import practiseImg from '../assets/media/app-berlatih.png';
import testImg from '../assets/media/app-diuji.png';

export interface Project {
  id: number;
  slug: string;
  title: string;
  type: 'video' | 'image';
  src: string;
  /** Keterangan singkat yang tampil bersama judul langkah. */
  description?: string;
  /** Teks alternatif gambar untuk pembaca layar. */
  alt: string;
}

/**
 * Tiga langkah aplikasi, satu tangkapan layar aplikasi sendiri per langkah —
 * bukan foto pihak ketiga, jadi isi gambar benar-benar produk yang dipakai.
 */
export const projects: Project[] = [
  {
    id: 1,
    slug: 'eksplorasi',
    title: 'Eksplorasi',
    type: 'image',
    src: exploreImg,
    alt: 'Tangkapan layar halaman pengenalan: judul langkah, maskot pendamping, dan kartu paranada.',
    description: 'Kenali garis paranada, ruang nada, dan bentuk notnya dulu, sebelum menyentuh tuts.',
  },
  {
    id: 2,
    slug: 'berlatih',
    title: 'Berlatih',
    type: 'image',
    src: practiseImg,
    alt: 'Tangkapan layar peta level Materi 1: barisan node level beserta bintang hasil latihan.',
    description: 'Ulangi tiap nada dan ritmenya sampai tanganmu hafal tanpa perlu melihat panduan lagi.',
  },
  {
    id: 3,
    slug: 'diuji',
    title: 'Diuji',
    type: 'image',
    src: testImg,
    alt: 'Tangkapan layar kuis posisi: satu not di paranada dan lima kotak nada C sampai G.',
    description: 'Tiap materi ditutup kuis singkat, jadi kemajuanmu benar-benar terukur dan bukan cuma terasa.',
  },
];
