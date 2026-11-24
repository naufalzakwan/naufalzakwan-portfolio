import { piscesStory } from "@/data/personal-storytelling";
import { PiscesDiagram, zodiacSigns } from "./pisces-diagram";
import { PiscesSequence } from "./pisces-sequence";
import styles from "./pisces-story.module.css";

export function PiscesStory() {
  const cards = zodiacSigns.slice(8);
  return (
    <article aria-labelledby="story-pisces-heading" className={styles.root} data-pisces-root id="story-pisces">
      <div className={styles.stage} data-pisces-stage>
        <div aria-hidden="true" className={styles.rolling} data-pisces-rolling>
          {piscesStory.openingHeadingLines.map((line, index) => (
            <section className={styles.openingScene} data-pisces-opening-scene key={line}>
              <p data-pisces-opening-line data-pisces-rolling-text={index === 1 ? "" : undefined}>
                {line.split(/ (?=ZODIAK)/).map((row, rowIndex) => (
                  <span className={styles.openingRow} key={row}>{rowIndex > 0 ? " " : null}{row}</span>
                ))}
              </p>
            </section>
          ))}
        </div>
        <div aria-hidden="true" className={styles.stack} data-pisces-stack>
          {cards.map((sign) => (
            <div className={styles.card} data-pisces-card data-sign={sign.name} key={sign.name}>
              <span className={styles.cardSymbol}>{sign.symbol}</span>
              <span className={styles.cardName}>{sign.name}</span>
            </div>
          ))}
        </div>
        <PiscesDiagram />
        <div className={styles.copy} data-pisces-copy>
          <h3 className={styles.heading} data-pisces-copy-item id="story-pisces-heading">{piscesStory.heading}</h3>
          <p className={styles.signMask}><span className={styles.sign} data-pisces-sign>{piscesStory.sign}</span></p>
          <div className={styles.paragraphs}>
            {piscesStory.paragraphs.map((paragraph) => <p data-pisces-paragraph key={paragraph}>{paragraph}</p>)}
          </div>
        </div>
      </div>
      <PiscesSequence />
    </article>
  );
}
