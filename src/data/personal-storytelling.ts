import type { StoryChapter, StoryPhoto } from "@/types/personal-storytelling";

export const aboutStories = [
  {
    id: "hometown",
    heading: "Tempat Saya Bertumbuh Pontianak",
    paragraph: "Pontianak adalah kota tempat saya lahir dan tumbuh, kota di garis khatulistiwa yang dibelah Sungai Kapuas. Di sini saya belajar tentang rumah, kebersamaan, dan hal-hal sederhana yang perlahan membentuk siapa saya hari ini.",
    photo: {
      status: "approved", src: "/images/tempat_bertumbuh/slide_1.webp", width: 736, height: 1308,
      alt: "Tugu Digulis di Pontianak saat senja",
      aspectRatio: "4 / 3", objectPosition: "center 64%", directory: "/images/tempat_bertumbuh/",
    },
  },
  {
    id: "family",
    heading: "Orang di Balik Cerita Saya",
    paragraph: "Di balik setiap langkah, karya, dan pencapaian yang saya ukir, selalu ada doa yang tak pernah putus dan punggung yang kokoh tempat saya bersandar. Merekalah orang-orang pertama yang percaya pada mimpi saya, bahkan sebelum saya sendiri mengerti cara mewujudkannya. Orang tua saya adalah rumah pertama, alasan utama saya bertahan sejauh ini, sekaligus tempat di mana cinta dan dukungan tanpa syarat selalu mengawal perjalanan ini. Nilai dan keteladanan merekalah yang membentuk karakter saya sekarang.",
    photo: {
      status: "approved", src: "/images/orang_tua/foto_orang_tua.webp", width: 2353, height: 2980,
      alt: "Foto Ayah dan Ibu saat wisuda Ibu",
      aspectRatio: "1 / 1", objectPosition: "center 35%", directory: "/images/orang_tua/",
    },
  },
] as const satisfies readonly StoryChapter[];

// Family-only presentation inside the existing square frame.
export const familyPhotoPresentation = { objectFit: "cover" } as const;

export const hometownPanels = [
  {
    title: "Tempat cerita bermula",
    headingLines: ["TEMPAT CERITA", "BERMULA"],
    footerValue: "1771",
    bullets: ["KOTA KELAHIRAN", "JEJAK & MEMORI", "RUANG PULANG"],
    body: "Tugu Digulis, penanda kota yang selalu terasa seperti rumah. Saksi bisu dari berbagai fase hidup saya sejak kecil hingga hari ini, melewatinya selalu membawa rasa tenang yang tidak pernah saya temukan di kota lain.",
    photo: { ...aboutStories[0].photo },
  },
  {
    title: "TUGU KHATULISTIWA",
    headingLines: ["TUGU", "KHATULISTIWA"],
    footerValue: "0°00'",
    bullets: ["TITIK NOL", "KOTA KHATULISTIWA", "ASAL MULA"],
    body: "Tugu Khatulistiwa menjadi penanda kota tempat saya lahir, tempat cerita saya bermula. Di bawah garis lintang nol derajat inilah seluruh memori masa kecil, jejak langkah, dan akar identitas saya tertanam.",
    photo: {
      ...aboutStories[0].photo,
      src: "/images/tempat_bertumbuh/slide_2.webp" as const, width: 736, height: 981,
      alt: "Tugu Khatulistiwa di Pontianak di bawah langit berawan", objectPosition: "center 66%",
    },
  },
  {
    title: "BUDAYA PONTIANAK",
    headingLines: ["BUDAYA", "PONTIANAK"],
    footerValue: "PNK",
    bullets: ["IDENTITAS BUDAYA", "WARISAN LELUHUR", "JEJAK LANGKAH"],
    body: "Tumbuh bersama budaya yang kaya di Pontianak. Mengenakan pakaian adat khas daerah kelahiran selalu membawa rasa bangga tersendiri.",
    photo: {
      ...aboutStories[0].photo,
      src: "/images/tempat_bertumbuh/slide_3.webp" as const, width: 3024, height: 4032,
      alt: "Mengenakan pakaian adat pada acara keluarga di Pontianak", objectPosition: "center 64%",
    },
  },
].map((panel, index) => ({
  ...panel,
  number: String(index + 1).padStart(2, "0"),
})) satisfies readonly { title: string; headingLines: readonly string[]; footerValue: string; bullets: readonly string[]; body: string; number: string; photo: StoryPhoto }[];

export const piscesStory = {
  openingHeadingLines: ["SELAIN BAHAS MUSIK", "ADA YANG KEPO SAMA ZODIAK SAYA GAK?"],
  heading: "Hai, Zodiak Saya",
  sign: "Pisces",
  paragraphs: [
    "Saya seorang Pisces. Kata orang saya orangnya sensitif, dan jujur aja emang bener sih. Dengar satu atau dua kalimat yang kurang pas di hati aja kadang udah cukup bikin saya kepikiran seharian penuh, bahkan bisa nyampe berminggu-minggu. Tapi di sisi lain, teman-teman sering bilang saya gampang peka sama perasaan orang. Belum juga mereka cerita panjang lebar, saya biasanya udah bisa nebak arahnya ke mana dan paham apa yang lagi mereka rasain. Karena saya sendiri tahu persis rasanya sakit hati, makanya saya selalu berusaha buat lebih hati-hati pas ngomong atau bersikap ke orang lain, supaya mereka nggak ngerasain hal yang sama.",
  ],
} as const;
