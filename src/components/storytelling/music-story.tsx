import Image from "next/image";
import { musicStory } from "@/data/music-story";
import { MusicSequence } from "./music-sequence";
import styles from "./music-story.module.css";

export function MusicStory() {
  const photo = musicStory.heroVisual;
  return (
    <div className={styles.root} data-music-story>
      <div className={styles.hero} data-music-hero>
        <h2 className={styles.heading} id="beyond-heading">{musicStory.headingBefore} <strong>{musicStory.emphasis}</strong> {musicStory.headingAfter}</h2>
        <p className={styles.introduction}>{musicStory.introduction.map((line, index) => <span key={line}>{line}{index < musicStory.introduction.length - 1 ? " " : ""}</span>)}</p>
        <figure className={styles.heroVisual}>
          <div className={styles.heroPhoto}>
            <Image alt={photo.alt} fill sizes="(min-width: 1024px) 25vw, (min-width: 768px) 40vw, calc(100vw - 2.5rem)" src={photo.src} style={{ objectFit: "cover", objectPosition: photo.objectPosition }} />
          </div>
        </figure>
      </div>
      <div className={styles.sequence} data-music-sequence>
        <div className={styles.viewport} data-music-viewport>
          <div className={styles.stack} data-music-stack>
            {musicStory.banners.map((banner) => (
              <article aria-describedby={banner.quote ? `music-${banner.id}-caption` : undefined} className={styles.banner} data-music-banner key={banner.id}>
                <Image alt={banner.alt} className={styles.bannerImage} fill sizes="calc(100vw - 2rem)" src={banner.src} style={{ objectPosition: banner.objectPosition }} />
                {banner.quote && <div className={styles.bannerContent} data-music-content>
                  <p className={styles.caption} data-music-caption id={`music-${banner.id}-caption`}>“{banner.quote}”</p>
                </div>}
              </article>
            ))}
          </div>
        </div>
      </div>
      <MusicSequence />
    </div>
  );
}
