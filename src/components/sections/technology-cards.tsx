"use client";

import Image from "next/image";
import { useState } from "react";
import type { capabilities } from "@/data/site-content";
import styles from "./technology-cards.module.css";

type Technology = (typeof capabilities.items)[number];

const details: Record<Technology, { logo: string }> = {
  HTML: {
    logo: "html",
  },
  CSS: {
    logo: "css",
  },
  JavaScript: {
    logo: "javascript",
  },
  React: {
    logo: "react",
  },
  "Next.js": {
    logo: "nextjs",
  },
  Flutter: {
    logo: "flutter",
  },
  TypeScript: {
    logo: "typescript",
  },
  GSAP: {
    logo: "gsap",
  },
  Figma: {
    logo: "figma",
  },
  ChatGPT: {
    logo: "chatgpt",
  },
  Claude: {
    logo: "claude",
  },
};

const descriptions: Record<Technology, string> = {
  HTML: "Saya menggunakan HTML untuk membangun struktur halaman web yang terorganisasi dan mudah dipahami. HTML menjadi fondasi dalam menciptakan pengalaman digital yang baik.",
  CSS: "Saya menggunakan CSS untuk mengatur tampilan, tata letak, dan responsivitas website agar setiap halaman terasa nyaman dan menarik di berbagai ukuran layar.",
  JavaScript: "JavaScript membantu saya menghadirkan interaksi yang membuat website terasa lebih hidup, mulai dari fungsi sederhana hingga pengalaman pengguna yang dinamis.",
  React: "React membantu saya membangun antarmuka melalui komponen yang dapat digunakan kembali sehingga proses pengembangan menjadi lebih terstruktur dan efisien.",
  "Next.js": "Saya menggunakan Next.js untuk mengembangkan aplikasi berbasis React dengan struktur yang lebih terorganisasi serta dukungan fitur modern untuk membangun website.",
  Flutter: "Flutter memungkinkan saya mengeksplorasi pengembangan aplikasi untuk berbagai platform melalui satu basis kode dan antarmuka yang fleksibel.",
  TypeScript: "TypeScript menambahkan sistem tipe pada JavaScript untuk membantu menemukan kesalahan lebih awal dan menjaga kode tetap mudah dipahami.",
  GSAP: "GSAP membantu menyusun animasi dan transisi yang halus, termasuk timeline serta gerakan yang mengikuti progress scrolling.",
  Figma: "Figma menjadi ruang untuk menyusun desain antarmuka, mengeksplorasi ide visual, dan membuat prototipe sebelum masuk ke tahap pengembangan.",
  ChatGPT: "ChatGPT membantu mengeksplorasi ide, memahami konsep, dan mendiskusikan berbagai pendekatan selama proses belajar serta pengembangan.",
  Claude: "Claude membantu menelaah ide dan kode, menyusun penjelasan, serta mempertimbangkan alternatif solusi dalam proses pengembangan.",
};

function TechnologyCard({ technology }: { technology: Technology }) {
  const detail = details[technology];
  const [expanded, setExpanded] = useState(false);

  return (
    <button className={styles.card} data-technology-surface data-expanded={expanded}
      type="button" aria-label={technology} aria-pressed={expanded}
      aria-describedby={expanded ? `technology-${detail.logo}-description` : undefined}
      onClick={() => setExpanded((value) => !value)}>
      <span className={styles.surface}>
        <span className={`${styles.face} ${styles.front}`} aria-hidden={expanded}>
          <span className={styles.identity}>
            <Image alt="" className={styles.logo} height={120}
              src={`/images/technologies/${detail.logo}.svg`} width={120} />
            <span className={styles.name}>{technology}</span>
          </span>
        </span>
        <span className={`${styles.face} ${styles.back}`} aria-hidden={!expanded}>
          <span className={styles.backTitle}>{technology}</span>
          <span className={styles.description} id={`technology-${detail.logo}-description`}>
            {descriptions[technology]}
          </span>
        </span>
      </span>
    </button>
  );
}

export function TechnologyCards({ technologies }: { technologies: readonly Technology[] }) {
  return (
    <ul aria-label="Teknologi" className={styles.grid}>
      {technologies.map((technology) => (
        <li className={styles.item} data-technology-card key={technology}>
          <TechnologyCard technology={technology} />
        </li>
      ))}
    </ul>
  );
}
