import Image from "next/image";

import type { StoryPhoto } from "@/types/personal-storytelling";

import styles from "./storytelling.module.css";

export function StoryVisual({ photo, sizes = "(min-width: 768px) 50vw, calc(100vw - 2.5rem)" }: { photo: StoryPhoto; sizes?: string }) {
  return (
    <figure className={styles.figure}>
      <div className={styles.frame} data-story-photo={photo.status} style={{ aspectRatio: photo.aspectRatio }}>
        {photo.status === "approved" ? (
          <Image alt={photo.alt} fill sizes={sizes} src={photo.src} style={{ objectFit: "cover", objectPosition: photo.objectPosition }} />
        ) : (
          <div className={styles.placeholder}>
            <span aria-hidden="true" className={styles.placeholderMark}>+</span>
          </div>
        )}
      </div>
    </figure>
  );
}
