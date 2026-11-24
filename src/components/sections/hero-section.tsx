import Image from "next/image";
import localFont from "next/font/local";

import { Container } from "@/components/ui";
import { hero, uiCopy } from "@/data/site-content";

import styles from "./hero-section.module.css";

const heroDisplay = localFont({
  src: "../../../public/fonts/anton/Anton-Regular.ttf",
  variable: "--font-hero-display",
  display: "swap",
});

export function HeroSection() {
  const labels = hero.eyebrow.split(" | ");

  return (
    <section aria-labelledby="hero-heading" className={`${heroDisplay.variable} ${styles.hero}`} id="hero">
      <div className={styles.stage} data-hero-parallax-stage>
        <div className={styles.photoFade}>
          <div className={styles.portrait} data-hero-portrait>
            <div className={styles.imageLayer} data-motion-hero="visual">
              <Image
                alt=""
                className={styles.image}
                fetchPriority="high"
                fill
                priority
                sizes="(max-aspect-ratio: 159/94) 170vh, 100vw"
                src="/images/profile%20profile_hd.webp"
              />
            </div>
            <div aria-hidden="true" className={styles.portraitUnderlap} data-hero-portrait-underlap>
              <Image
                alt=""
                className={styles.continuationImage}
                fill
                sizes="(max-aspect-ratio: 159/94) 170vh, 100vw"
                src="/images/profile%20profile_hd.webp"
              />
            </div>
          </div>
        </div>
        <Container className={styles.masthead} data-hero-foreground>
          <h1 className={styles.headline} data-hero-entrance="title" id="hero-heading">
            {["Muhammad Naufal", "Zakwan"].map((line) => (
              <span className={styles.nameLine} key={line}>
                <span className={styles.ink}>{line}</span>
                {line !== "Zakwan" && (
                  <span aria-hidden="true" className={styles.mist}>{line}</span>
                )}
                {" "}
              </span>
            ))}
          </h1>
          <div className={styles.labels} data-motion-hero="meta">
            {labels.map((label) => <span data-hero-entrance="role" key={label}>{label}</span>)}
          </div>
        </Container>
        <Container className={styles.lower}>
          <p className={styles.year} data-hero-foreground>
            <span className="sr-only">{uiCopy.hero.year}</span>
            <span aria-hidden="true" data-hero-entrance="year">20</span><span aria-hidden="true" data-hero-entrance="year">26</span>
          </p>
        </Container>
      </div>
    </section>
  );
}
