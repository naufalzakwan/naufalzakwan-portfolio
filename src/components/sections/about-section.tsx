import Image from "next/image";
import { Container } from "@/components/ui";
import { AboutStories } from "@/components/storytelling/personal-storytelling";
import { about } from "@/data/site-content";
import { aboutChapters } from "@/data/about-chapters";
import { AboutChapterSequence } from "./about-chapter-sequence";
import { OriginGlobe } from "@/components/storytelling/origin-globe";

import styles from "./about-section.module.css";

export function AboutSection() {
  return (
    <section aria-labelledby="about-heading" className={styles.section} id="about">
      <div aria-hidden="true" className={styles.overlapEdge} data-hero-overlap-edge />
      <Container>
        <h2 className="sr-only" id="about-heading">{about.heading}</h2>
        <div className={styles.intro} data-about-chapters>
          <div className={styles.stage} data-about-chapter-stage>
            {aboutChapters.map((chapter, index) => (
              <article aria-label={`Bab ${index + 1} dari 3`} className={styles.chapter} data-about-chapter={chapter.number} key={chapter.id}>
                <figure className={styles.figure} data-about-chapter-photo={chapter.number}>
                  <div className={styles.photo}>
                    {chapter.photo.src ? <Image alt={chapter.photo.alt} fill sizes="(min-width: 1024px) 26rem, (min-width: 768px) 50vw, calc(100vw - 2.5rem)" src={chapter.photo.src} style={{ objectFit: "cover", objectPosition: chapter.photo.objectPosition }} /> : <div aria-label={chapter.photo.alt} className={styles.placeholder} role="img" />}
                  </div>
                </figure>
                <div className={styles.copy} data-about-chapter-copy>
                  <p className={styles.lyric} data-about-chapter-text>
                    {chapter.text.split(/(\s+)/).map((part, wordIndex) => /\s+/.test(part) ? part : <span data-about-chapter-word key={wordIndex}>{part}</span>)}
                  </p>
                </div>
              </article>
            ))}
          </div>
          <AboutChapterSequence />
        </div>
      </Container>
      <OriginGlobe />
      <AboutStories />
    </section>
  );
}
