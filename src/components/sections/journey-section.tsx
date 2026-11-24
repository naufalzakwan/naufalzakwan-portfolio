import type { CSSProperties } from "react";

import { Container } from "@/components/ui";
import { journeyCharacter } from "@/data/journey-character";

import { JourneySequence } from "./journey-sequence";
import { WorksMarquee } from "./works-marquee";
import styles from "./journey-section.module.css";

export function JourneySection() {
  return (
    <section aria-labelledby="journey-heading" className={styles.section} id="journey">
      <Container>
        <div className={styles.scene} data-journey-scene>
          <div className={styles.backdrop} data-journey-backdrop>
            <h2 className={styles.title} data-journey-title id="journey-heading"><span>KARAKTER</span>{" "}<span>SAYA</span></h2>
            <span aria-hidden="true" className={styles.markers}>+<span>+</span>+</span>
          </div>
          <ol aria-label="Karakter dan pola pikir saya" className={styles.cards}>
            {journeyCharacter.map((card, index) => (
              <li className={styles.card} data-journey-card key={card.number} style={{ "--card-row": index + 1 } as CSSProperties}>
                <h3>{card.title}</h3>
                <p className={styles.cardCopy}>{card.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </Container>
      <WorksMarquee />
      <JourneySequence />
    </section>
  );
}
