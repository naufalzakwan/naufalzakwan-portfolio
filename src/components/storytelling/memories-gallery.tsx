import type { Memory } from "@/data/memories";
import { MemoryImage } from "./memory-image";
import styles from "./memories-orbit.module.css";

export function MemoriesGallery({ memories }: { memories: readonly Memory[] }) {
  return (
    <div className={styles.gallery} data-memory-orbit>
      <div aria-label="Galeri lima kenangan. Gulir atau gunakan tombol panah untuk menjelajahi foto."
        aria-roledescription="carousel" className={styles.stage} data-memory-carousel role="region" tabIndex={0}>
        <svg aria-hidden="true" className={styles.ticks} data-memory-orbit-ticks />
        {memories.map((memory, index) => (
          <figure aria-label={`Foto ${index + 1} dari ${memories.length}: ${memory.alt}`}
            className={styles.card} data-memory-card data-memory-id={memory.id} key={memory.id}>
            <MemoryImage memory={memory} sizes="(min-width: 896px) 450px, 76vw" />
          </figure>
        ))}
      </div>
      <span className={styles.status} data-memory-status aria-live="polite" aria-atomic="true" />
    </div>
  );
}
