import { MusicNote } from "./music-note";
import styles from "./process-section.module.css";

const headline = "Di sela-sela dunia teknologi, saya punya satu kesukaan lain yaitu mendengarkan musik.";

export function ProcessSection() {
  return (
    <>
      <div className={styles.scene} data-music-scene>
        <section aria-label="Musik" className={styles.section} id="process">
          <div className={styles.stage} data-music-note-stage>
            <MusicNote />
          </div>
        </section>
        <section aria-labelledby="process-heading" className={styles.statement} id="music-statement">
          <div className={styles.copy} data-music-statement-copy>
            <h2 aria-label={headline} className={styles.headline} id="process-heading">
              {headline.split(" ").map((word, index) => (
                <span aria-hidden="true" className={index >= 10 ? styles.emphasis : undefined} key={`${word}-${index}`}>
                  {word}{" "}
                </span>
              ))}
            </h2>
          </div>
        </section>
      </div>
      <div aria-hidden="true" className={styles.runway} data-music-scroll-runway />
    </>
  );
}
