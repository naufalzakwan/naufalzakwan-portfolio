import { about } from "./site-content";

type ChapterPhoto = Readonly<{ src: string | null; alt: string; objectPosition: string }>;

// Photos follow the introduction, creative mindset, and frontend chapters.
export const aboutChapterPhotos = [
  { src: "/images/about/foto1.webp", alt: "Foto Muhammad Naufal Zakwan untuk bab perkenalan", objectPosition: "center center" },
  { src: "/images/about/foto2.webp", alt: "Foto Muhammad Naufal Zakwan untuk bab pola pikir kreatif", objectPosition: "center center" },
  { src: "/images/about/foto3.webp", alt: "Foto Muhammad Naufal Zakwan untuk bab pengembangan frontend", objectPosition: "center center" },
] as const satisfies readonly ChapterPhoto[];

export const aboutChapters = about.paragraphs.map((text, index) => ({
  id: `about-chapter-${index + 1}`,
  number: String(index + 1).padStart(2, "0"),
  text,
  photo: aboutChapterPhotos[index] as ChapterPhoto,
}));
