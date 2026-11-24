import Image from "next/image";
import styles from "./memories-opening.module.css";
import { TypewriterKeyboard, typewriterAsset } from "./typewriter-keyboard";

export const memoryOpeningText = "Kilas Balik Perjalanan Saya";

export function MemoriesOpening() {
  let characterIndex = 0;
  const words = memoryOpeningText.split(" ");
  return (
    <section aria-label="Pembuka cerita hidup" className={styles.opening} data-memory-opening-stage>
      <h3 aria-label={memoryOpeningText} className={styles.heading} id="story-memories-heading">
        <span aria-hidden="true" className={styles.text} data-memory-opening-text>
          {words.map((word, index) => (
            <span className={styles.word} key={word}>
              {Array.from(word + (index < words.length - 1 ? " " : "")).map(character => (
                <span className={styles.character} data-typewriter-character key={characterIndex++}>{character}</span>
              ))}
            </span>
          ))}
        </span>
      </h3>
      <div className={styles.machine} data-typewriter-machine>
        <div className={styles.machineVisual}>
          <Image alt="Mesin tik klasik dengan bodi enamel gading, tombol gelap, rel metal, dan selembar kertas kosong"
            className={styles.machineImage} src={typewriterAsset}
            width={1440} height={960} sizes="(min-width: 896px) 45vw, 95vw" />
          <TypewriterKeyboard />
        </div>
      </div>
    </section>
  );
}
