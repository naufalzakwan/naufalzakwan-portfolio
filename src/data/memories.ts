export type Memory = Readonly<{
  id: string; image: string | null; alt: string; title: string; description: string;
  width: number; height: number; imagePosition: string;
}>;

// Existing assets. Stories are editable starter copy, not factual photo captions.
// See public/images/memories/README.md for replacement instructions.
export const memories: readonly Memory[] = [
  {
    id: "memory-01", image: "/images/profile/duduk_dikursi.webp",
    alt: "Duduk di kursi dengan pajangan di latar belakang", width: 2268, height: 4032,
    imagePosition: "center center", title: "Ingatan Paling Awal",
    description: "Ada bagian dari masa kecil yang terasa seperti mimpi, samar di antara ingat dan lupa, dan foto ini adalah salah satunya. Di usia tiga tahun, saya hanya samar mengingat bayangan ayah mengajak saya masuk ke sebuah ruangan besar di acara perpisahan TK abang, tempat yang sama sekali asing bagi pikiran kecil saya waktu itu. Ia menuntun saya berdiri di depan kamera dan menyuruh saya meletakkan tangan di pinggang, meninggalkan satu bukti nyata dari potongan ingatan yang nyaris pudar ditelan waktu.",
  },
  {
    id: "memory-02", image: "/images/memories/foto2.png",
    alt: "Melihat lukisan di sebuah ruang pamer", width: 853, height: 1280,
    imagePosition: "center center", title: "Langkah Awal di Pintu Kelas",
    description: "Jika ingatan usia tiga tahun tadi masih terasa kabur seperti mimpi, hari pertama masuk TK ini justru menempel jelas di kepala saya. Saya masih ingat ayah mengantar saya ke depan kelas yang ramai oleh orang tua lain yang setia menunggu anaknya, sementara ayah harus pamit pergi bekerja setelah menitipkan saya pada guru. Melihat lambaian tangannya, saya langsung berlari memeluknya sambil menangis karena tidak ingin ditinggal sendirian. Ayah sempat menggendong saya sebentar dan berjanji tidak akan lama, sebelum akhirnya guru menuntun saya masuk ke ruang kelas.",
  },
  {
    id: "memory-03", image: "/images/memories/foto3.png",
    alt: "Berdiri di samping patung berbentuk boneka", width: 3024, height: 4032,
    imagePosition: "center center", title: "Pentas Seni",
    description: "Potret dengan kostum merah dan latar candi ini merekam momen panggung pertama saya semasa TK. Untuk acara pentas seni yang membagi tema berbeda di tiap kelas, kelas saya terpilih menampilkan tarian kuda lumping yang latihannya dimulai dari menonton rekaman CD bersama di depan kelas seminggu sebelumnya. Begitu hari acara tiba, kami maju ke atas panggung dengan penuh percaya diri, meski gerakan satu sama lain berjalan sendiri-sendiri karena banyak yang lupa urutan tarinya.",
  },
  {
    id: "memory-04", image: "/images/memories/foto7.png",
    alt: "Potret diri di dalam ruangan", width: 3024, height: 3780,
    imagePosition: "center center", title: "Kebersamaan di Halaman Sekolah",
    description: "Berdiri bersama satu kelas di halaman sekolah dengan seragam batik biru putih ini selalu berhasil membawa ingatan saya kembali ke masa-masa paling riang. Tidak ada beban pikiran di kepala kami saat itu, selain bagaimana caranya menghabiskan jam istirahat untuk bermain bersama. Foto ini menjadi pengingat manis tentang awal mula saya belajar bersosialisasi dan menemukan teman-teman sepermainan pertama dalam hidup.",
  },
  {
    id: "memory-05", image: "/images/memories/foto5.png",
    alt: "Menggunakan laptop dengan pemandangan kota pada malam hari", width: 3024, height: 4032,
    imagePosition: "center center", title: "Gerbang Perjalanan Baru",
    description: "Setelah melewati hari-hari penuh tawa dan kepolosan di bangku TK, tibalah saatnya saya menanggalkan seragam lama dan mengenakan putih merah untuk pertama kalinya. Di balik potret berlatar merah ini, ada wajah seorang anak yang mulai mencoba tampil lebih berani, meski jauh di dalam hati masih menyimpan rasa canggung menghadapi lingkungan yang jauh lebih besar. Tanpa saya sadari, jepretan singkat ini menjadi gerbang pembuka menuju perjalanan panjang yang pelan-pelan membentuk saya sekarang",
  },
];

// Keep gallery frame dimensions and chapter photos independent. The existing
// orbit returns to the first card for its sixth/final presentation.
export const memoriesGallery: readonly Memory[] = memories.map((memory, index) => ({
  ...memory,
  image: `/images/memories/foto${index === 3 ? 7 : index + 1}.png`,
  alt: `Foto kenangan ${index + 1}`,
}));

export const memoriesIntro = {
  label: "Momen di antara perjalanan",
  description: "Waktu terus berjalan maju, tapi sebuah foto lama selalu punya cara untuk membawa kita pulang ke perasaan paling jujur di masa lalu.",
};
