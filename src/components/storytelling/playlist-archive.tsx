import Image from "next/image";
import type { CSSProperties } from "react";
import { playlistArchive } from "@/data/playlist-archive";
import { PlaylistCarousel } from "./playlist-carousel";
import styles from "./playlist-archive.module.css";

export function PlaylistArchive() {
  return (
    <article aria-labelledby="playlist-archive-heading" className={styles.archive} data-playlist-archive>
      <div className={styles.header}>
        <h3 className={styles.heading} id="playlist-archive-heading">{playlistArchive.heading}<span aria-hidden="true" className={styles.dot}>.</span></h3>
        <p className={styles.description}>{playlistArchive.description}</p>
      </div>
      <PlaylistCarousel>
        <ol className={styles.track} data-cd-track>
          {playlistArchive.discs.map((disc) => {
            const src: string | null = disc.src;
            const style = {
              "--disc-diameter": disc.diameter, "--disc-rise": disc.rise,
              "--disc-tilt": `${disc.tilt}deg`, "--disc-ink": disc.ink,
              "--disc-glow": disc.glow, "--disc-paper": disc.paper,
            } as CSSProperties;
            return (
              <li className={styles.item} data-cd-item={disc.id} key={disc.id} style={style}>
                <figure className={styles.figure}>
                  <div aria-label={disc.alt} className={styles.disc} role="img">
                    {src ? <Image alt="" className={styles.artwork} fill sizes="(max-width: 767px) 75vw, 480px" src={src} style={{ objectFit: "cover", objectPosition: disc.objectPosition }} /> : <div aria-hidden="true" className={styles.artwork} data-pattern={disc.pattern} />}
                  </div>
                </figure>
              </li>
            );
          })}
        </ol>
      </PlaylistCarousel>
    </article>
  );
}
