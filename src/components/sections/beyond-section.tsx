import { Container } from "@/components/ui";
import { BeyondStories } from "@/components/storytelling/personal-storytelling";
import { MusicStory } from "@/components/storytelling/music-story";
import { PlaylistArchive } from "@/components/storytelling/playlist-archive";
import styles from "./beyond-section.module.css";

export function BeyondSection() {
  return (
    <section aria-labelledby="beyond-heading" className={`${styles.section} scroll-mt-18 pb-(--section-space)`} id="beyond">
      <div className={styles.musicBand}>
        <Container>
          <MusicStory />
        </Container>
      </div>
      <div className={styles.afterMusic}>
        <Container>
          <PlaylistArchive />
          <BeyondStories />
        </Container>
      </div>
    </section>
  );
}
