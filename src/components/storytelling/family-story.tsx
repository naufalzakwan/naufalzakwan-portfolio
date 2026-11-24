import Image from "next/image";
import type { CSSProperties } from "react";

import { aboutStories, familyPhotoPresentation } from "@/data/personal-storytelling";
import type { StoryPhoto } from "@/types/personal-storytelling";

import { FamilySequence } from "./family-sequence";
import styles from "./family-story.module.css";

function FamilyVisual({ photo }: { photo: StoryPhoto }) {
  return (
    <figure className={styles.visual} data-family-visual>
      <div className={styles.photo} data-family-photo={photo.status} style={{ "--family-photo-ratio": photo.aspectRatio } as CSSProperties}>
        {photo.status === "approved" ? (
          <Image alt={photo.alt} fill sizes="(min-width: 1280px) 448px, (min-width: 1024px) 38vw, (min-width: 768px) 60vw, calc(100vw - 2.5rem)" src={photo.src} style={{ objectFit: familyPhotoPresentation.objectFit, objectPosition: photo.objectPosition }} />
        ) : (
          <div className={styles.placeholder}>
            <span aria-hidden="true" className={styles.plus}>+</span>
          </div>
        )}
      </div>
    </figure>
  );
}

export function FamilyStory() {
  const family = aboutStories[1];
  return (
    <article aria-labelledby="story-family-heading" className={styles.root} data-family-story id="story-family">
      <div className={styles.viewport} data-family-viewport>
        <div className={styles.track} data-family-track>
          <div className={styles.titleScene} data-family-title-scene>
            <h3 className={styles.heading} id="story-family-heading">
              {family.heading.split(/(\s+)/).map((word, index) => /\s+/.test(word) ? word : <span data-family-title-word key={index}>{word}</span>)}
            </h3>
          </div>
          <div className={styles.storyScene} data-family-story-scene>
            <div className={styles.storyFrame}>
              <FamilyVisual photo={family.photo} />
              <div className={styles.narrative} data-family-narrative>
                <p className={styles.copy}>
                  {family.paragraph.split(/(\s+)/).map((word, index) => /\s+/.test(word) ? word : <span data-family-word key={index}>{word}</span>)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <FamilySequence />
    </article>
  );
}
