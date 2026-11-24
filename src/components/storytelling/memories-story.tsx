import { memories, memoriesGallery, memoriesIntro } from "@/data/memories";
import { MemoriesGallery } from "./memories-gallery";
import { MemoriesChapters } from "./memories-chapters";
import { MemoryImage } from "./memory-image";
import styles from "./memories.module.css";

export function MemoriesIntro() {
  let characterIndex = 0;
  return (
    <section aria-label="Galeri kenangan" className={styles.intro} data-memories-intro>
      <p aria-label={memoriesIntro.description} className={styles.introduction} data-memory-reading>
        <span aria-hidden="true">
          {memoriesIntro.description.match(/\S+\s*/g)?.map((word, index) => (
            <span className={styles.readingWord} key={index}>
              {Array.from(word).map(character => (
                <span className={styles.readingCharacter} data-memory-reading-character key={characterIndex++}>{character}</span>
              ))}
            </span>
          ))}
        </span>
      </p>
      <MemoriesGallery memories={memoriesGallery} />
    </section>
  );
}

export function MemoriesStory({ shared = false }: { shared?: boolean }) {
  return (
    <article aria-labelledby="story-memories-heading" className={styles.memories} data-memories-root>
      <section aria-label="Cerita di balik foto" className={styles.chapters} data-memories-chapters>
        <div className={styles.chapterStage} data-memory-stage>
          <div className={styles.chapterStack} data-memory-stack>
            {memories.map((memory) => (
              <section aria-labelledby={`${memory.id}-title`} className={styles.chapter} data-memory-chapter data-memory-id={memory.id} key={memory.id}>
                <div className={styles.chapterContent} data-memory-content>
                  <figure className={styles.chapterFigure} data-memory-photo>
                    <div className={styles.chapterFrame} data-memory-detail-frame>
                      <MemoryImage memory={memory} sizes="(min-width: 896px) 40vw, 85vw" />
                    </div>
                  </figure>
                  <div className={styles.chapterCopy} data-memory-copy>
                    <h4 id={`${memory.id}-title`}>{memory.title}</h4>
                    <p className={styles.description}>{memory.description}</p>
                  </div>
                </div>
              </section>
            ))}
          </div>
        </div>
        {!shared && <MemoriesChapters />}
      </section>
    </article>
  );
}
