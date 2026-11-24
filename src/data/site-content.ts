import type {
  Capability,
  ContentSection,
  HeroContent,
  ImageAsset,
  NavigationItem,
  ProcessStep,
  Profile,
  Project,
  SocialLink,
} from "@/types";

export const profile = {
  fullName: "Muhammad Naufal Zakwan",
  shortName: "N. Zakwan",
  professionalTitle: "Front-end Developer | Creative Thinker | Problem Solver",
  location: "Pontianak, Indonesia",
  locationLabel: "Berbasis di Pontianak, Indonesia",
  age: 21,
  education: "Lulusan Teknik Informatika",
  institution: "Politeknik Negeri Pontianak",
  currentStatus: "Lulusan baru Teknik Informatika",
} as const satisfies Profile;

export const profileAssets = {
  hero: {
    src: "/images/profile/profile_naufal.webp",
    alt: "Potret Muhammad Naufal Zakwan",
  },
  about: {
    src: "/images/profile/sedang_menggunakan_laptop.webp",
    alt: "Muhammad Naufal Zakwan menggunakan laptop ASUS pada malam hari",
  },
} as const satisfies Readonly<Record<"hero" | "about", ImageAsset>>;

export const musicAssets = {
  primary: {
    src: "/images/music/kaset.webp",
    alt: "Pemutar piringan hitam beserta piringan dan sampul album dalam pencahayaan hangat",
  },
  secondary: {
    src: "/images/music/kasel.webp",
    alt: "Koleksi piringan hitam di rak dengan pencahayaan ruangan yang hangat",
  },
} as const satisfies Readonly<Record<"primary" | "secondary", ImageAsset>>;

export const navigation = [
  { label: "Beranda", href: "#hero" },
  { label: "Tentang Saya", href: "#about" },
  { label: "Tempat Lahir", href: "#tempat-lahir" },
  { label: "Orang di Balik Cerita", href: "#story-family" },
  { label: "Karakter Saya", href: "#journey" },
  { label: "Karya Saya", href: "#works" },
  { label: "Tools & Teknologi", href: "#capabilities" },
  { label: "Musik", href: "#beyond" },
  { label: "Zodiak Saya", href: "#zodiak-saya" },
  { label: "Jejak Perjalanan", href: "#jejak-perjalanan" },
  { label: "Kontak Saya", href: "#connect" },
] as const satisfies readonly NavigationItem[];

export const hero = {
  eyebrow: profile.professionalTitle,
  heading: "Mengubah ide menjadi pengalaman digital.",
  paragraphs: [
    "Halo, saya Muhammad Naufal Zakwan — lulusan baru Teknik Informatika yang senang menciptakan pengalaman digital, menjelajahi teknologi, dan memecahkan masalah melalui pemikiran kreatif.",
    "Saya percaya pengalaman digital yang baik berawal dari rasa ingin tahu, desain yang dipikirkan dengan matang, dan kemauan untuk terus belajar.",
  ],
  primaryCta: { label: "Jelajahi Karya Saya", href: "#works" },
  secondaryCta: { label: "Mari Terhubung", href: "#contact" },
} as const satisfies HeroContent;

export const about = {
  heading: "Tentang Saya",
  paragraphs: [
    "Kenalin, saya Muhammad Naufal Zakwan. Umur 21 tahun, baru aja lulus Teknik Informatika dari Politeknik Negeri Pontianak, dan sekarang lagi seru-serunya ngerakit berbagai karya sambil terus nempa diri. Buat saya, tiap baris kode sama tampilan visual itu cara paling jujur buat nyampein cerita",
    "Saya tipe orang yang gampang penasaran sama cara kerja sesuatu. Dari logika di balik layar sampai hal-hal kecil kayak kenapa sebuah tampilan bisa enak banget dipandang. Makanya, tiap ada tantangan baru, saya gak pernah mandang itu sebagai beban, tapi justru jadi arena seru buat bereksperimen dan nemu solusi yang bener-bener berasa dampaknya.",
    "Sekarang, saya lagi fokus banget di dunia Frontend Development. Senang rasanya pas liat ide mentah di kepala bisa berubah jadi wujud interaktif yang bisa langsung dirasain orang banyak. Dari sinilah saya siap melangkah bawa energi baru buat terjun ke industri kreatif yang lebih luas. Tapi sebelum itu, yuk kita intip dulu ke belakang, gimana semua fondasi ini awalnya kebentuk.",
  ],
} as const satisfies ContentSection;

export const mindset = {
  heading: "Rasa ingin tahu. Pola pikir kreatif.",
  paragraphs: [
    "Saya senang melihat masalah dari berbagai sudut pandang, menjelajahi kemungkinan, dan belajar dari prosesnya.",
    "Saya menghargai kreativitas, kemampuan beradaptasi, dan perbaikan yang berkelanjutan. Setiap tantangan menjadi kesempatan untuk menemukan hal baru dan mengembangkan kemampuan saya.",
  ],
} as const satisfies ContentSection;

export const capabilities = {
  heading: "Teknologi untuk mewujudkan ide.",
  description: "Saya senang menjelajahi teknologi dan menggunakannya untuk membangun pengalaman digital di berbagai platform.",
  items: ["HTML", "CSS", "JavaScript", "React", "Next.js", "Flutter", "TypeScript", "GSAP", "Figma", "ChatGPT", "Claude"],
} as const satisfies Readonly<{
  heading: string;
  description: string;
  items: readonly Capability[];
}>;

export const processSteps = [
  {
    number: "01",
    title: "Kenali",
    description: "Memahami kebutuhan dan mengenali masalah yang perlu diselesaikan.",
  },
  {
    number: "02",
    title: "Rencanakan",
    description: "Merancang struktur dan menentukan pendekatan teknis.",
  },
  {
    number: "03",
    title: "Bangun",
    description: "Membangun antarmuka beserta fungsinya.",
  },
  {
    number: "04",
    title: "Sempurnakan",
    description: "Menguji, memperbaiki kesalahan, mengoptimalkan, dan menyempurnakan hasil akhir.",
  },
] as const satisfies readonly ProcessStep[];

export const beyond = {
  heading: "Musik, bagian dari dunia saya.",
  paragraphs: [
    "Di luar dunia teknologi, musik adalah salah satu hal yang saya sukai.",
    "Musik memberi saya sudut pandang berbeda, ruang untuk menjelajahi kreativitas, dan cara menikmati momen di luar layar.",
  ],
} as const satisfies ContentSection;

export const contact = {
  heading: "Punya ide? Mari wujudkan sesuatu yang bermakna.",
  paragraphs: [
    "Saya selalu terbuka untuk terhubung, berbagi ide, dan menjajaki peluang baru.",
    "Baik untuk membahas teknologi, kreativitas, maupun kemungkinan berkolaborasi, jangan ragu untuk menyapa.",
  ],
} as const satisfies ContentSection;

export const socialLinks = [
  { platform: "github", label: "GitHub", href: "https://github.com/naufalzakwan" },
  {
    platform: "linkedin",
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/muhammad-naufal-zakwan/",
  },
  { platform: "instagram", label: "Instagram", href: "https://www.instagram.com/naufalzkwan" },
  {
    platform: "tiktok",
    label: "TikTok",
    href: "https://www.tiktok.com/@oldmoneycheck_?is_from_webapp=1&sender_device=pc",
  },
] as const satisfies readonly SocialLink[];

export const projects = [
  {
    name: "EGGGYM",
    summary: "Aplikasi pengelolaan dan keanggotaan pusat kebugaran.",
    status: "needs-owner-input",
    imageSrc: "/images/projects/admin_egggym/dashboard.webp",
  },
] as const satisfies readonly Project[];

export const footer = {
  copyright: "Muhammad Naufal Zakwan © 2026",
  location: "Pontianak, Indonesia.",
} as const;

export const journeyPrinciples = [
  { number: "01", title: "Berbagai Sudut Pandang", description: "Melihat masalah dari lebih dari satu sudut pandang." },
  { number: "02", title: "Jelajahi Kemungkinan", description: "Menjaga rasa ingin tahu sambil mempertimbangkan berbagai kemungkinan." },
  { number: "03", title: "Belajar dari Proses", description: "Menjadikan proses itu sendiri sebagai ruang untuk terus belajar." },
  { number: "04", title: "Terus Berkembang", description: "Menghargai kreativitas dan kemampuan beradaptasi sambil bertumbuh melalui setiap tantangan." },
] as const;

export const uiCopy = {
  metadataDescription: "Portofolio pribadi Muhammad Naufal Zakwan, seorang Front-End Developer yang berbasis di Pontianak, Indonesia.",
  skipToContent: "Langsung ke konten",
  menu: "Menu",
  close: "Tutup",
  mainMenu: "Menu utama",
  primaryNavigation: "Navigasi utama",
  noScriptNavigation: "Navigasi utama tanpa JavaScript",
  backToTop: "Kembali ke atas",
  hero: { year: "Tahun portofolio 2026", scroll: "Gulir untuk menjelajah" },
  about: { label: "Tentang Saya" },
  journey: {
    label: "Perjalanan",
    summaryLabel: "Ringkasan pola pikir",
    summary: "Pola pikir yang dibentuk oleh rasa ingin tahu, kreativitas, dan kemampuan beradaptasi.",
    progress: "Terus berproses",
    motivation: "Yang menggerakkan saya",
  },
  works: {
    heading: "Karya yang saya bangun.",
    description: "Satu proyek yang sudah dikonfirmasi, ditampilkan sesuai informasi yang tersedia.",
    visualLabel: "Antarmuka dasbor admin EGGGYM",
    imageAlt: "Dasbor admin EGGGYM yang menampilkan statistik, grafik, dan aktivitas terbaru",
    projectLabel: "Proyek",
    status: "Status",
    statusLabels: { "needs-owner-input": "Menunggu informasi pemilik", verified: "Terverifikasi" },
    technology: "Teknologi",
    contribution: "Kontribusi",
    links: "Tautan",
    notProvided: "Belum tersedia",
    pendingNote: "Detail yang belum tersedia akan ditampilkan setelah dikonfirmasi.",
  },
  capabilities: {
    label: "Kemampuan",
    noteLabel: "Catatan kemampuan",
    note: "Pilihan teknologi untuk membentuk pengalaman digital.",
    verified: "Daftar terkonfirmasi",
    caption: "Teknologi terkonfirmasi / tanpa peringkat",
  },
  process: {
    label: "Cara Saya Bekerja",
    heading: "Dari ide menjadi nyata.",
    description: "Alur yang jelas untuk menyusun proses pengembangan portofolio ini, dari memahami kebutuhan hingga menyempurnakan hasilnya.",
    contextLabel: "Konteks proses pengembangan",
    context: "Alur yang jelas untuk mengembangkan sebuah ide.",
    approach: "Pendekatan pengembangan portofolio.",
    framework: "Alur pengembangan portofolio",
    stages: "tahap",
  },
  beyond: {
    visualLabel: "Komposisi bertema musik dengan pemutar piringan hitam dan koleksi rekaman",
    soundStudy: "Eksplorasi bunyi",
    music: "Musik",
    perspective: "Ritme / Ruang / Perspektif",
    study: "Eksplorasi musik pribadi",
    caption: "Eksplorasi musik pribadi / tanpa audio",
    aside: "Sejenak di luar antarmuka",
    interest: "Minat",
    meaning: "Makna",
    meaningDescription: "Sudut pandang, kreativitas, dan momen di luar layar.",
    media: "Media",
    photographs: "Foto pribadi",
  },
  contact: {
    label: "Mari Terhubung",
    profiles: "Terhubung melalui profil yang telah dikonfirmasi",
    socialNavigation: "Profil media sosial",
    newTab: " — profil, dibuka di tab baru",
  },
  notFound: {
    heading: "Halaman tidak ditemukan",
    description: "Halaman yang Anda cari tidak tersedia.",
    back: "Kembali ke beranda",
  },
} as const;

export const siteContent = {
  profile,
  profileAssets,
  navigation,
  hero,
  about,
  mindset,
  capabilities,
  processSteps,
  beyond,
  musicAssets,
  contact,
  socialLinks,
  projects,
  footer,
  journeyPrinciples,
  uiCopy,
} as const;
