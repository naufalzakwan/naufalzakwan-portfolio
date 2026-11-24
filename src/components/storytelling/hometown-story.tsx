import { Anton } from "next/font/google";
import Image from "next/image";
import { aboutStories, hometownPanels } from "@/data/personal-storytelling";

import styles from "./hometown-story.module.css";

const hometownDisplay = Anton({
  subsets: ["latin"], weight: "400", display: "swap", variable: "--font-hometown-display",
});

export function HometownStory() {
  const story = aboutStories[0];

  return (
    <article aria-labelledby="story-hometown-heading" className={styles.sequence} data-hometown-story id="tempat-lahir">
      <div className={styles.stage} data-hometown-stage>
        <div className={styles.left}>
          <div className={styles.narrative} data-hometown-narrative>
            <h3 aria-label={story.heading} className={`${hometownDisplay.variable} ${styles.heading}`} id="story-hometown-heading">
              <span>TEMPAT SAYA</span>{" "}
              <span>BERTUMBUH</span>{" "}
              <span className={styles.city}>PONTIANAK</span>
            </h3>
            <p className={styles.body}>{story.paragraph}</p>
          </div>
        </div>
        <div className={styles.panels} data-hometown-panels role="region" aria-label="Cerita Kota Pontianak">
          {hometownPanels.map((panel) => (
            <div className={`${styles.panel} ${styles.editorialPanel} ${hometownDisplay.variable}`} data-hometown-panel={panel.number} data-hometown-editorial key={panel.number}>
              <header className={styles.editorialHeader} data-editorial-header>
                <span className={styles.editorialNumber}>{panel.number}</span>
                <h4 aria-label={panel.headingLines.join(" ")} className={styles.editorialHeading}>
                  {panel.headingLines.map((line) => <span key={line}>{line}</span>)}
                </h4>
              </header>
              <div className={styles.editorialMiddle}>
                <p className={styles.editorialCopy} data-panel-body>{panel.body}</p>
                <figure className={styles.editorialVisual} data-editorial-visual>
                  <Image alt={panel.photo.alt} src={panel.photo.src} fill
                    sizes="(min-width: 960px) 22vw, calc(100vw - 3rem)"
                    style={{ objectFit: "cover", objectPosition: panel.photo.objectPosition }} />
                </figure>
              </div>
              <footer className={styles.editorialFooter} data-editorial-footer>
                <p className={styles.editorialCoordinates}>{panel.footerValue}</p>
                <ul className={styles.editorialList}>
                  {panel.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                </ul>
              </footer>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
